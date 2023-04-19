import store from "./store";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash-es";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FFprobeWorker } from "ffprobe-wasm";
import fileToArrayBuffer from "file-to-array-buffer";

const probeWorker = new FFprobeWorker();

const readFileAsBase64 = async (file: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const updateState = (assignments: any) => {
  store.dispatch({
    type: "updateState",
    assignments: assignments,
  });
};
const ffmpeg = createFFmpeg({ log: false });
export const importFiles = async (files: FileList) => {
  let state = store.getState().reducer;
  let mediaFiles = new Array<MediaFile>();
  let videoTrack = new Array<VideoTrackItem>();
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
  for (let i of files) {
    if (["video/mp4"].indexOf(i.type) >= 0) {
      let id = nanoid();
      // get thumbnail
      ffmpeg.FS("writeFile", id, new Uint8Array(await fileToArrayBuffer(i)));
      await ffmpeg.run(
        "-ss",
        "0",
        "-i",
        id,
        "-t",
        "1",
        "-vf",
        `scale=150:-1`,
        `thumb_${id}.png`
      );
      let thumbnailDataUrl = await readFileAsBase64(
        new Blob([ffmpeg.FS("readFile", `thumb_${id}.png`).buffer], {
          type: "image/png",
        })
      );
      let duration = (await probeWorker.getFrames(i, 0)).nb_frames;
      ffmpeg.FS("unlink", `thumb_${id}.png`);
      // update
      mediaFiles.push({
        fileName: i.name,
        id: id,
        type: "video",
        objectURL: URL.createObjectURL(i),
        thumbnailDataUrl: thumbnailDataUrl,
        duration: duration,
      });
      videoTrack.push({
        id: nanoid(),
        mediaFileId: id,
        beginOffset: 0,
        duration: duration,
      });
    } else if (["image/jpeg", "image/png"].indexOf(i.type) >= 0) {
      mediaFiles.push({
        fileName: i.name,
        id: nanoid(),
        type: "map",
        objectURL: URL.createObjectURL(i),
        thumbnailDataUrl: await readFileAsBase64(i),
        duration: 0,
      });
    }
  }
  updateState({
    mediaFiles: cloneDeep(state.mediaFiles).concat(mediaFiles),
    videoTrack: cloneDeep(state.videoTrack).concat(videoTrack),
  });
  return mediaFiles.length;
};
