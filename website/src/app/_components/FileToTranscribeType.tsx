export interface FileToTranscribe {
  filename: string;
  filesize: number;
  filehash: string;
  playbackSeconds: number;
  file: File;
}
