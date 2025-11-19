## Guide to Download and Deploy the ffmpeg Lambda Layer

Follow this guide to download and deploy the ffmpeg Lambda Layer.:
https://aws.amazon.com/de/blogs/media/processing-user-generated-content-using-aws-lambda-and-ffmpeg/

See also this repo for an example struxcture of the lambda layer.:
https://github.com/adito0211/lamba-ffmpeg-sample/tree/main

```
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz.md5\n
cat ffmpeg-release-amd64-static.tar.xz.md5
md5sum -c ffmpeg-release-amd64-static.tar.xz.md5\n
tar xvf ffmpeg-release-amd64-static.tar.xz\n
mkdir -p ffmpeg/bin\n
cp ffmpeg-6.1-amd64-static/ffmpeg ffmpeg/bin
```
