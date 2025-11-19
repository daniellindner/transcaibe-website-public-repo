import hashlib
import json
import os
import subprocess
import tempfile
import time

import boto3
import openai
import requests

# env vars defined by cdk code
VERCEL_DEPLOYMENT_URL = os.getenv("VERCEL_DEPLOYMENT_URL")
AWS_API_KEY = os.getenv("AWS_API_KEY")
BUCKET = os.getenv("BUCKET")
OPENAI_API_KEY_SECRET_NAME = os.getenv("OPENAI_API_KEY_SECRET_NAME")

# env vars defined by aws lambda extension layer
PARAMETERS_SECRETS_EXTENSION_HTTP_PORT = "2773"

# create api_key header
headers_for_vercel = {
    "api_key": AWS_API_KEY
}
s3 = boto3.client("s3")


def get_openai_api_key():
    """ GET OPENAI API KEY FROM AWS SECRETS MANAGER """
    headers = {"X-Aws-Parameters-Secrets-Token": os.environ.get('AWS_SESSION_TOKEN')}
    secrets_extension_endpoint = "http://localhost:" + \
                                 PARAMETERS_SECRETS_EXTENSION_HTTP_PORT + \
                                 "/secretsmanager/get?secretId=" + \
                                 OPENAI_API_KEY_SECRET_NAME
    # retry requests until the extension is ready
    count = 0
    while True:
        r = requests.get(secrets_extension_endpoint, headers=headers)
        # print(r.status_code, r.text)
        time.sleep(0.2)
        if r.status_code == 200 or count > 50:
            break
    # print(r.status_code, r.text)

    return json.loads(r.text)["SecretString"]


class FileCheckException(Exception):
    pass


def handler(event, context):
    # Steps for processing audio files:
    # 1. Get S3 event. Check that the event is for a new audio file, not a transcription text file.
    # 2. Retrieve file information from the database.
    # 3. Check that order status is COMPLETED and transcription status is NOT_STARTED.
    # 4. Get the audio file from S3.
    # 5. Compare file hash with the expected file hash from the database.
    # 6. Compare file size with the expected file size from the database.
    # 7. If file hash and size match, update transcription status to IN_PROGRESS.
    # 8. Transcribe the audio file using OpenAI API.
    # If transcription is successful:
    #    - Create a transcription text file and upload it to S3.
    #    - Update transcription status to COMPLETED and add transcription text, transcription blob key to the database.
    # Else:
    #    - Consider retrying OpenAI transcription once. -> for now, just fail.
    #    - Update transcription status to FAILED.

    print(event)

    s3_event = json.loads(event["Records"][0]["body"])
    audio_s3_key = s3_event["Records"][0]["s3"]["object"]["key"]

    if audio_s3_key.endswith(".transcription.txt"):
        print("Transcription text file found. Exiting.")
        return

    try:
        # get file info from db
        file_info = requests.get(VERCEL_DEPLOYMENT_URL + "/api/getFileInfo", headers=headers_for_vercel, params={
            "blobS3Key": audio_s3_key
        }).json()

        print(file_info)

        # check order payment status
        if file_info["transcriptionOrder"]["paypalOrderStatus"] != "COMPLETED":
            raise FileCheckException("Order status paypalOrderStatus is not COMPLETED. Exiting.")

        # check file is not already transcribed
        if file_info["transcriptionStatus"] != "NOT_STARTED":
            print("Transcription status is not NOT_STARTED. File was already transcribed. Exiting.")
            return

            # get audio file from s3
        with tempfile.TemporaryDirectory() as tmpdir:
            audio_file_path = os.path.join(tmpdir, file_info["filename"])
            s3.download_file(BUCKET, audio_s3_key, audio_file_path)

            # compare file hash
            db_file_hash = file_info["filehash"]
            with open(audio_file_path, "rb") as f:
                download_file_hash = hashlib.file_digest(f, "sha256").hexdigest()

            if db_file_hash != download_file_hash:
                raise FileCheckException(
                    f"File hash does not match. Exiting. \n {db_file_hash} : db_file_hash\n {download_file_hash} : download_file_hash")

            # compare file size

            db_file_size = file_info["filesize"]
            download_file_size = os.path.getsize(audio_file_path)

            if db_file_size != download_file_size:
                raise FileCheckException(
                    f"File size does not match. Exiting. \n {db_file_size} : db_file_size\n {download_file_size} : download_file_size")

            # update transcription status to IN_PROGRESS
            in_progress_update_request = requests.post(VERCEL_DEPLOYMENT_URL + "/api/updateTranscription",
                                                       headers=headers_for_vercel,
                                                       json={
                                                           "blobS3Key": audio_s3_key,
                                                           "transcriptionStatus": "IN_PROGRESS"
                                                       })

            in_progress_update_request.raise_for_status()

            # transcode audio file to opus format this allows us to send much longer file to OpenAI API (there is a
            # 25MB limit) this enables files up to 3 hours instead of ~45 mins
            # we only need to encode if raw file is
            # bigger than 25MB, this saves on lambda execution time for short files get file size
            if download_file_size > 24_500_000:
                # use this ffmpeg command to transcode to opus
                # ffmpeg -i original-audio.m4a -vn -map_metadata -1 -ac 1 -c:a libopus -b:a 12k -application voip transcoded-audio.ogg
                transcoded_file_path = os.path.join(tmpdir, file_info["filename"] + ".ogg")
                # time transcoding time
                print("starting to transcode file")
                start = time.time()
                p1 = subprocess.run(
                    ["ffmpeg", "-i", str(audio_file_path), "-vn", "-map_metadata", "-1", "-ac", "1", "-c:a", "libopus",
                     "-b:a", "12k", "-application", "voip", str(transcoded_file_path)], capture_output=True)
                print("transcode output")
                print(p1.stdout.decode("utf-8"))
                print(p1.stderr.decode("utf-8"))
                print("transcode time in seconds: ", time.time() - start)
                print("Original file size: ", os.path.getsize(audio_file_path))
                print("Transcoded file size: ", os.path.getsize(transcoded_file_path))
            else:
                print("File is smaller than 25MB, no need to transcode. Only stripping metadata. Filesize: ",
                      download_file_size)

                # strip audio file off metadata, metadata created error 400 on OpenAI API before
                print("File is smaller than 25MB, no need to transcode. Only stripping metadata. Filesize: ",
                      download_file_size)
                os.makedirs(os.path.join(tmpdir, "stripped/"), exist_ok=True)
                transcoded_file_path = os.path.join(tmpdir, "stripped/", file_info["filename"])

                try:
                    p2 = subprocess.run(
                        ["ffmpeg", "-i", str(audio_file_path), "-c", "copy", "-map_metadata", "-1",
                         str(transcoded_file_path)],
                        capture_output=True, check=True
                    )
                    print("strip metadata output")
                    print(p2.stdout.decode("utf-8"))
                    print(p2.stderr.decode("utf-8"))
                except subprocess.CalledProcessError as e:
                    print(f"Error stripping metadata: {e}")
                    print(e.stdout.decode("utf-8"))
                    print(e.stderr.decode("utf-8"))
                    raise

            # transcribe audio file using OpenAI API
            openai_client = openai.Client(api_key=get_openai_api_key())

            with open(transcoded_file_path, "rb") as f:
                transcription_response = openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f
                )

            transcription_text = transcription_response.text
            print("transcription_text ", transcription_text)

            # create transcription text file and upload to s3
            # create temp file
            transcription_file_path = os.path.join(tmpdir, file_info["filename"] + ".transcription.txt")
            with open(transcription_file_path, "w") as f:
                f.write(transcription_text)
            # upload to s3
            transcription_s3_key = audio_s3_key + ".transcription.txt"
            s3.upload_file(transcription_file_path, BUCKET, transcription_s3_key)

            r = requests.post(VERCEL_DEPLOYMENT_URL + "/api/updateTranscription", headers=headers_for_vercel, json={
                "blobS3Key": audio_s3_key,
                "transcriptionStatus": "COMPLETED",
                "transcriptionText": transcription_text,
                "transcriptionBlobS3Key": transcription_s3_key
            })

            print(r.status_code, r.content)
    except FileCheckException as e:
        print(f"Transcription failed. FileCheckException. File check failed. Message: {str(e)}")
        print(e)
        r = requests.post(VERCEL_DEPLOYMENT_URL + "/api/updateTranscription", headers=headers_for_vercel, json={
            "blobS3Key": audio_s3_key,
            "transcriptionStatus": "FAILED",
            "transcriptionText": f"Transcription failed. FileCheckException. File check failed. Message: {str(e)}",
        })
        print(r.status_code, r.content)
    except Exception as e:
        print(f"Transcription failed. General exception. Message: {str(e)}")
        print(e)
        r = requests.post(VERCEL_DEPLOYMENT_URL + "/api/updateTranscription", headers=headers_for_vercel, json={
            "blobS3Key": audio_s3_key,
            "transcriptionStatus": "FAILED",
            "transcriptionText": f"Transcription failed. General exception. Message: {str(e)}",
        })
        print(r.status_code, r.content)
