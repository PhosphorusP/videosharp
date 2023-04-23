import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FFprobeWorker } from "ffprobe-wasm";
import { cloneDeep, max, min } from "lodash-es";
import { ArrayBufferTarget, Muxer } from "mp4-muxer";
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

export const formatTimestamp = (frame: number, fps: number) =>
  `${("0" + Math.floor(frame / fps / 60).toString()).slice(-2)}:${(
    "0" + Math.floor((frame / fps) % 60).toString()
  ).slice(-2)}:${("0" + (frame % fps).toString()).slice(-2)}`;

export const updateState = (assignments: any) => {
  store.dispatch({
    type: "updateState",
    assignments: assignments,
  });
};
export const checkStateStacks = () => {
  let state = store.getState().reducer;
  let { undoStack, redoStack } = cloneDeep(state);
  if (undoStack.length > 20) undoStack.splice(0, undoStack.length - 20);
  if (redoStack.length > 20) redoStack.splice(0, redoStack.length - 20);
  updateState({ undoStack, redoStack });
};
export const saveState = () => {
  let state = store.getState().reducer;
  let {
    undoStack,
    mediaFiles,
    videoTrack,
    subtitleTracks,
    mapTracks,
    selectedId,
  } = cloneDeep(state);
  undoStack.push({
    mediaFiles,
    videoTrack,
    subtitleTracks,
    mapTracks,
    selectedId,
  });
  updateState({ undoStack, redoStack: [] });
  checkStateStacks();
};
export const undo = () => {
  if (!store.getState().reducer.redoStack.length) saveState();
  let state = store.getState().reducer;
  let { undoStack, redoStack } = cloneDeep(state);
  redoStack.push(undoStack.pop());
  updateState({ undoStack, redoStack, ...undoStack.at(-1) });
  checkStateStacks();
};
export const redo = () => {
  let state = store.getState().reducer;
  let { undoStack, redoStack } = cloneDeep(state);
  let current = redoStack.pop();
  undoStack.push(current);
  if (!redoStack.length) undoStack.pop();
  updateState({ undoStack, redoStack, ...current });
  checkStateStacks();
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
export const getTrackDuration = (track: TrackClip[]) =>
  track.reduce((a: number, b) => {
    let endB = b.beginOffset + b.duration;
    return a > endB ? a : endB;
  }, 0);
export const getTracksDuration = () => {
  let state = store.getState().reducer;
  let durations = [] as number[];
  durations.push(getTrackDuration(state.videoTrack));
  for (let mapTrack of state.mapTracks as MapTrackItem[])
    durations.push(getTrackDuration(mapTrack.clips));
  return max(durations) as number;
};
export const getTrackStart = (track: TrackClip[]) =>
  track.reduce((a: number, b) => {
    let endB = b.beginOffset;
    return a < endB ? a : endB;
  }, track[0].beginOffset);
export const importFiles = async (files: FileList) => {
  await initFF();
  saveState();
  let state = store.getState().reducer;
  let mediaFiles = new Array<MediaFile>();
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
  updateState({
    importing: true,
  });
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
        "-profile:v",
        "baseline",
        "-preset",
        "superfast",
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
        file: transcoded,
        thumbnailDataUrl: thumbnailDataUrl,
        duration: duration,
      });
      videoTrack.push({
        id: nanoid(),
        mediaFileId: id,
        mediaOffset: 0,
        beginOffset: getTrackDuration(videoTrack),
        duration: duration,
      } as VideoTrackClip);
    } else if (["image/jpeg", "image/png"].indexOf(i.type) >= 0) {
      let id = nanoid();
      mediaFiles.push({
        fileName: i.name,
        id: id,
        type: "map",
        objectURL: URL.createObjectURL(i),
        file: i,
        thumbnailDataUrl: await readFileAsBase64(i),
        duration: 0,
      });
      if (!mapTracks.length)
        mapTracks.push({
          id: nanoid(),
          clips: [] as MapTrackClip[],
        } as MapTrackItem);
      mapTracks[0].clips.push({
        id: nanoid(),
        mediaFileId: id,
        beginOffset: getTrackDuration(mapTracks[0].clips),
        duration: state.projectFPS * 3,
      });
    }
  }
  updateState({
    mediaFiles: cloneDeep(state.mediaFiles).concat(mediaFiles),
    videoTrack,
    mapTracks,
    importing: false,
  });
  ffmpeg.exit();
  return mediaFiles.length;
};

export const deleteClip = (id: string) => {
  let state = store.getState().reducer;
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
  if (videoTrack.findIndex((i) => i.id === id) >= 0)
    videoTrack.splice(
      videoTrack.findIndex((i) => i.id === id),
      1
    );
  for (let mapTrack of mapTracks)
    if (mapTrack.clips.findIndex((i) => i.id === id) >= 0)
      mapTrack.clips.splice(
        mapTrack.clips.findIndex((i) => i.id === id),
        1
      );
  updateState({
    videoTrack,
    mapTracks,
    selectedId: "",
  });
};

export const appendMapTrack = () => {
  const mapTracks = cloneDeep(store.getState().reducer.mapTracks);
  mapTracks.push({
    id: nanoid(),
    clips: [] as MapTrackClip[],
  } as MapTrackItem);
  updateState({
    mapTracks: mapTracks,
  });
};

export const alignTracks = () => {
  let state = store.getState().reducer;
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
  let starts = [] as number[];
  if (videoTrack.length) starts.push(getTrackStart(videoTrack));
  for (let mapTrack of mapTracks)
    if (mapTrack.clips.length) starts.push(getTrackStart(mapTrack.clips));
  let start = min(starts) as number;
  for (let i of videoTrack) i.beginOffset -= start;
  for (let i of mapTracks) for (let j of i.clips) j.beginOffset -= start;
  updateState({
    videoTrack,
    mapTracks,
  });
};

export const cutAtCursor = () => {
  saveState();
  let state = store.getState().reducer;
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let currentFrame = state.currentFrame as number;
  let clip = videoTrack.find(
    (i) =>
      currentFrame >= i.beginOffset &&
      currentFrame <= i.beginOffset + i.duration - 1
  );
  if (clip) {
    videoTrack.push({
      id: nanoid(),
      mediaFileId: clip.mediaFileId,
      mediaOffset: currentFrame - clip.beginOffset + clip.mediaOffset,
      beginOffset: currentFrame,
      duration: clip.duration - (currentFrame - clip.beginOffset),
    } as VideoTrackClip);
    clip.duration = currentFrame - clip.beginOffset;
  }
  updateState({
    videoTrack,
  });
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
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // compose videoTrack
  {
    let videoTrack = state.videoTrack as VideoTrackClip[];
    let mediaFiles = state.mediaFiles as MediaFile[];
    let vid = videoTrack.find(
      (i) =>
        frameNum >= i.beginOffset && frameNum <= i.beginOffset + i.duration - 1
    );
    if (vid) {
      let mediaFile = mediaFiles.find(
        (i: MediaFile) => i.id === vid!.mediaFileId
      ) as MediaFile;
      let mediaFrame = frameNum - vid.beginOffset + vid.mediaOffset;
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
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, state.projectSize[0], state.projectSize[1]);
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
  await initFF();
  let state = store.getState().reducer;
  const trackDuration = getTracksDuration();
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
  let canvas = document.createElement("canvas"); //document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = state.projectSize[0];
  canvas.height = state.projectSize[1];
  for (let i = 0; i < trackDuration; i++) {
    await composeFrame(i, canvas);
    let frame = new VideoFrame(canvas, {
      timestamp: (i * 1e6) / state.projectFPS,
    });
    videoEncoder.encode(frame, { keyFrame: i / state.projectFPS === 10 });
    frame.close();
  }
  await videoEncoder.flush();
  muxer.finalize();
  let { buffer } = muxer.target;
  let composed = new Blob([buffer], { type: "video/mp4" });
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let mediaFiles = state.mediaFiles as MediaFile[];
  let fps = state.projectFPS;
  for (let i of mediaFiles)
    ffmpeg.FS("writeFile", i.id, await fetchFile(i.file));
  videoTrack.sort((a, b) => a.beginOffset - b.beginOffset);
  let audioTrackArr = [];
  for (let i = 0; i < videoTrack.length; i++) {
    // insert silent between videos
    if (
      i > 0 &&
      videoTrack[i].beginOffset >
        videoTrack[i - 1].beginOffset + videoTrack[i - 1].duration
    ) {
      let silId = nanoid();
      let silDuration =
        (videoTrack[i].beginOffset -
          (videoTrack[i - 1].beginOffset + videoTrack[i - 1].duration)) /
        fps;
      await ffmpeg.run(
        "-f",
        "lavfi",
        "-i",
        `color=size=${state.projectSize[0]}x${state.projectSize[1]}:rate=${fps}:color=black`,
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-t",
        `${silDuration}`,
        "-f",
        "mp4",
        `${silId}`
      );
      audioTrackArr.push({
        sil: false,
        fileName: silId,
      } as AudioTrackItem);
    }
    // cut video
    await ffmpeg.run(
      "-i",
      `${videoTrack[i].mediaFileId}`,
      "-ss",
      `${(videoTrack[i].mediaOffset / fps).toFixed(3)}`,
      "-t",
      `${(videoTrack[i].duration / fps).toFixed(3)}`,
      "-f",
      "mp3",
      `${videoTrack[i].id}`
    );
    audioTrackArr.push({
      sil: false,
      fileName: videoTrack[i].id,
    } as AudioTrackItem);
  }
  //generate audio
  let fileList = audioTrackArr.map((i) => `file ${i.fileName}`).join("\n");
  ffmpeg.FS("writeFile", "concat_list.txt", fileList);
  await ffmpeg.run(
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    "concat_list.txt",
    "generated.mp3"
  );
  ffmpeg.FS("writeFile", "composed.mp4", await fetchFile(composed));
  await ffmpeg.run(
    "-i",
    "composed.mp4",
    "-i",
    "generated.mp3",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "output.mp4"
  );
  let output = new Blob([ffmpeg.FS("readFile", "output.mp4")], {
    type: "video/mp4",
  });
  let url = URL.createObjectURL(output);
  window.open(url);
  ffmpeg.exit();
};
