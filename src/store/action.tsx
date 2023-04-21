import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FFprobeWorker } from "ffprobe-wasm";
import { cloneDeep } from "lodash-es";
import { nanoid } from "nanoid";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
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
const ffmpeg = createFFmpeg({
  log: true,
  corePath: new URL("./ffmpeg-core/ffmpeg-core.js", document.location.href)
    .href,
});
export const initFF = async () => {
  store.dispatch({
    type: "updateState",
    assignments: {
      appLoading: true,
    },
  });
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
  store.dispatch({
    type: "updateState",
    assignments: {
      appLoading: false,
    },
  });
};
export const importFiles = async (files: FileList) => {
  await initFF();
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
      let duration = (await probeWorker.getFrames(transcoded, 0)).nb_frames;

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
  updateState({
    mediaFiles: cloneDeep(state.mediaFiles).concat(mediaFiles),
    videoTrack: cloneDeep(state.videoTrack).concat(videoTrack),
    importing: false,
  });
  ffmpeg.exit();
  return mediaFiles.length;
};

export const setCurrentFrame = (frameNum: number) => {
  updateState({
    currentFrame: frameNum,
  });
};

export const composeFrame = async (
  frameNum: number,
  canvas: HTMLCanvasElement
) => {
  let state = store.getState().reducer;
  let ctx = canvas.getContext("2d");
  // compose videoTrack
  if (state.videoTrack.length) {
    let mediaFiles = state.mediaFiles;
    let videoTrack = state.videoTrack as VideoTrackItem[];
    let curDuration = 0;
    let curVideoTrackItem = -1;
    while (frameNum >= curDuration && curVideoTrackItem < videoTrack.length) {
      curDuration += videoTrack[++curVideoTrackItem].duration;
    }
    if (frameNum <= curDuration) {
      let mediaFile = mediaFiles.find(
        (i: MediaFile) => i.id === videoTrack[curVideoTrackItem].mediaFileId
      ) as MediaFile;
      let mediaFrame =
        frameNum - (curDuration - videoTrack[curVideoTrackItem].duration);
      let videoHost = document.getElementById("video-host") as HTMLVideoElement;
      let currentTime = (mediaFrame + 1) / state.projectFPS;
      await new Promise<void>((res) => {
        if (videoHost.src === mediaFile.objectURL) {
          if (Math.abs(currentTime - videoHost.currentTime) < 1e-6) {
            ctx?.drawImage(videoHost, 0, 0);
            res();
          } else {
            videoHost.requestVideoFrameCallback(() => {
              ctx?.drawImage(videoHost, 0, 0);
              res();
            });
            videoHost.currentTime = currentTime;
          }
        } else {
          let videoUpdateHandler = () => {
            ctx?.drawImage(videoHost, 0, 0);
            videoHost.removeEventListener("canplay", videoUpdateHandler);
            res();
          };
          videoHost.addEventListener("canplay", videoUpdateHandler);
          videoHost.src = mediaFile.objectURL;
          videoHost.currentTime = currentTime;
        }
      });
    }
  }
};
export const composeCurrentFrame = () => {
  let state = store.getState().reducer;
  composeFrame(
    state.currentFrame,
    document.getElementById("canvas") as HTMLCanvasElement
  );
};
export const exportVideo = async () => {
  let state = store.getState().reducer;
  const trackDuration = state.videoTrack.length
    ? state.videoTrack.reduce(
        (prev: number, cur: VideoTrackItem) => prev + cur.duration,
        0
      )
    : 0;
  let muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: "avc",
      width: state.projectSize[0],
      height: state.projectSize[1],
    },
    firstTimestampBehavior: "offset",
  });
  let videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => undefined,
  });
  videoEncoder.configure({
    codec: "avc1.42001f",
    width: state.projectSize[0],
    height: state.projectSize[1],
    bitrate: 1e6,
  });
  let canvas = document.getElementById("canvas") as HTMLCanvasElement;
  for (let i = 0; i < trackDuration; i++) {
    await composeFrame(i, canvas);
    let frame = new VideoFrame(canvas, {
      timestamp: (i * 1e6) / state.projectFPS,
    });
    videoEncoder.encode(frame, { keyFrame: i / state.projectFPS === 10 });
    frame.close();

    //await new Promise((res) => setTimeout(res, 500));
  }
  await videoEncoder.flush();
  muxer.finalize();
  let { buffer } = muxer.target;
  let url = URL.createObjectURL(new Blob([buffer], { type: "video/mp4" }));
  window.open(url);
};
export default { composeFrame };
