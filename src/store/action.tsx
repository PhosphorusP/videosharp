import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FFprobeWorker } from "ffprobe-wasm";
import { cloneDeep } from "lodash-es";
import { nanoid } from "nanoid";
import store from "./store";

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
const ffmpeg = createFFmpeg({ log: true });
export const initFF = async () => {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
};
export const importFiles = async (files: FileList) => {
  let state = store.getState().reducer;
  let mediaFiles = new Array<MediaFile>();
  let videoTrack = new Array<VideoTrackItem>();
  updateState({
    importing: true,
  });
  //await initFF();
  for (let i of files) {
    if (["video/mp4"].indexOf(i.type) >= 0) {
      let id = nanoid();
      // get thumbnail
      ffmpeg.FS("writeFile", `tmp_${id}`, await fetchFile(i));
      console.error("transcode");
      await ffmpeg.run(
        "-i",
        `tmp_${id}`,
        `-r`,
        `${state.projectFPS}`,
        "-vf",
        `scale=${state.projectSize[0]}:${state.projectSize[1]}:force_original_aspect_ratio=decrease,pad=${state.projectSize[0]}:${state.projectSize[1]}:(ow-iw)/2:(oh-ih)/2`,
        "-f",
        "mp4",
        `${id}`
      );
      console.error("----------------");
      await ffmpeg.run(
        "-ss",
        "0",
        "-i",
        `tmp_${id}`,
        "-vframes",
        "1",
        "-vf",
        `select=eq(n\\,0), scale=150:-1`,
        `thumb_${id}.png`
      );
      let thumbnailDataUrl = await readFileAsBase64(
        new Blob([ffmpeg.FS("readFile", `thumb_${id}.png`).buffer], {
          type: "image/png",
        })
      );
      let transcoded = new File(
        [
          new Blob([ffmpeg.FS("readFile", `${id}`).buffer], {
            type: "image/png",
          }),
        ],
        id
      );
      console.log(await probeWorker.getFrames(transcoded, 0));
      let duration = (await probeWorker.getFrames(transcoded, 0)).nb_frames;
      ffmpeg.exit();
      // update
      mediaFiles.push({
        fileName: i.name,
        id: id,
        type: "video",
        objectURL: URL.createObjectURL(transcoded),
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
  console.log(mediaFiles, videoTrack);
  updateState({
    mediaFiles: cloneDeep(state.mediaFiles).concat(mediaFiles),
    videoTrack: cloneDeep(state.videoTrack).concat(videoTrack),
    importing: false,
  });
  return mediaFiles.length;
};

export const setCurrentFrame = (frameNum: number) => {
  updateState({
    currentFrame: frameNum,
  });
};

export const composeFrame = async (frameNum: number) => {
  await initFF();
  let state = store.getState().reducer;
  let canvas = document.getElementById("canvas") as HTMLCanvasElement; //document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  console.log(state);
  // compose videoTrack
  {
    let mediaFiles = state.mediaFiles;
    let videoTrack = state.videoTrack as VideoTrackItem[];
    let curDuration = 0;
    let curVideoTrackItem = -1;
    console.log("compose video");
    while (frameNum >= curDuration && curVideoTrackItem < videoTrack.length) {
      curDuration += videoTrack[++curVideoTrackItem].duration;
    }
    if (frameNum <= curDuration) {
      let mediaFile = mediaFiles.find(
        (i: MediaFile) => i.id === videoTrack[curVideoTrackItem].mediaFileId
      ) as MediaFile;
      let mediaFrame =
        frameNum - (curDuration - videoTrack[curVideoTrackItem].duration);
      console.log("mediaFrame", mediaFrame);
      let videoHost = document.getElementById("video-host") as HTMLVideoElement;
      await new Promise<void>((res) => {
        if (videoHost.src === mediaFile.objectURL) {
          console.log("update", (mediaFrame + 1) / state.projectFPS);
          videoHost.requestVideoFrameCallback(()=> {
            console.log('video frame callback')
            
          ctx?.drawImage(videoHost, 0, 0);
          })
          videoHost.currentTime = (mediaFrame + 1) / state.projectFPS;
          //videoHost.requestVideoFrameCallback(()=> {
          
          res();
          //})
        } else {
          let videoUpdateHandler = () => {
            console.log("handler");
            ctx?.drawImage(videoHost, 0, 0);
            videoHost.removeEventListener("canplaythrough", videoUpdateHandler);
            res();
          };
          videoHost.addEventListener("canplaythrough", videoUpdateHandler);
          videoHost.src = mediaFile.objectURL;
          videoHost.currentTime = (mediaFrame + 1) / state.projectFPS;
        }
      });
    }
  }
};
export const composeCurrentFrame = () => {
  let state = store.getState().reducer;
  composeFrame(state.currentFrame);
};
export const composeAll = async () => {
  let state = store.getState().reducer;
  const trackDuration = state.videoTrack.length
    ? state.videoTrack.reduce(
        (prev: number, cur: VideoTrackItem) => prev + cur.duration,
        0
      )
    : 0;
  for (let i = 0; i <= trackDuration; i++) {
    console.log(i);
    await composeFrame(i);
  }
  alert("done!");
};
export default { composeFrame };
