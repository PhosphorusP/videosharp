import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { MessageInstance } from "antd/es/message/interface";
import { FFprobeWorker } from "ffprobe-wasm";
import { cloneDeep, max, min } from "lodash-es";
import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { nanoid } from "nanoid";
import { MapArtRender, SubtitleArtRender } from "../utils/ArtRenders";
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

export const getFiles = (
  accept: String = "*",
  multiple: Boolean = false
): Promise<FileList> =>
  new Promise((resolve) => {
    const fileInput: HTMLInputElement = document.createElement("input");
    Object.assign(fileInput, {
      type: "file",
      accept: accept,
      multiple: multiple,
    });
    let destroyed = false;
    const destroy = () => {
      if (destroyed) return;
      fileInput.remove();
      window.removeEventListener("focus", destroy);
      destroyed = true;
    };
    window.addEventListener("focus", () => {
      destroy();
    });
    fileInput.addEventListener("input", () => {
      let files = fileInput.files;
      destroy();
      if (files) resolve(files);
    });
    fileInput.click();
  });

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
    tracksSort,
    mapTracks,
    selectedId,
  } = cloneDeep(state);
  undoStack.push({
    mediaFiles,
    videoTrack,
    subtitleTracks,
    tracksSort,
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
  log: false,
  corePath: new URL("./ffmpeg-core/ffmpeg-core.js", document.location.href)
    .href,
});
ffmpeg.setLogger(({ message }) => {
  let ffmpegLogs = cloneDeep(store.getState().reducer.ffmpegLogs);
  ffmpegLogs.push(message);
  updateState({
    ffmpegLogs,
  });
});
export const initFF = async () => {
  store.dispatch({
    type: "updateState",
    assignments: {
      ffmpegLoading: true,
    },
  });
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
  store.dispatch({
    type: "updateState",
    assignments: {
      ffmpegLoading: false,
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
  for (let subtitleTrack of state.subtitleTracks as SubtitleTrackItem[])
    durations.push(getTrackDuration(subtitleTrack.clips));
  return max(durations) as number;
};
export const getTrackStart = (track: TrackClip[]) =>
  track.reduce((a: number, b) => {
    let endB = b.beginOffset;
    return a < endB ? a : endB;
  }, track[0].beginOffset);
export const importFiles = async (
  files: FileList,
  messageApi: MessageInstance
) => {
  if (
    store.getState().reducer.importing ||
    store.getState().reducer.exporting
  ) {
    messageApi.error("正在处理其他文件，请稍后");
    return;
  }
  const videoMime = ["video/mp4"];
  const mapMime = ["image/jpeg", "image/png"];
  await initFF();
  saveState();
  {
    let state = store.getState().reducer;
    if (
      Array.prototype.filter.call(
        files,
        (i: File) => mapMime.indexOf(i.type) >= 0
      ).length &&
      !state.mapTracks.length
    ) {
      appendMapTrack();
    }
  }
  let state = store.getState().reducer;
  let mediaFiles = new Array<MediaFile>();
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
  updateState({
    importing: true,
    ffmpegLogs: [],
  });
  let progress = Array.prototype.map.call(files, (i: File) => ({
    fileName: i.name,
    progress: "waiting",
  })) as ImportProgress;
  updateState({
    importProgress: progress,
  });
  for (let item = 0; item < files.length; item++) {
    let i = files.item(item) as File;
    progress[item].progress = "converting";
    updateState({
      importProgress: progress,
    });
    if (videoMime.indexOf(i.type) >= 0) {
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
        data: {},
      });
      videoTrack.push({
        id: nanoid(),
        mediaFileId: id,
        mediaOffset: 0,
        beginOffset: getTrackDuration(videoTrack),
        duration: duration,
      } as VideoTrackClip);
    } else if (mapMime.indexOf(i.type) >= 0) {
      let id = nanoid();
      let objectURL = URL.createObjectURL(i);
      let mediaSize = await new Promise<[number, number]>((res) => {
        let img = new Image();
        img.onload = () => res([img.width, img.height]);
        img.src = objectURL;
      });
      mediaFiles.push({
        fileName: i.name,
        id: id,
        type: "map",
        objectURL: objectURL,
        file: i,
        thumbnailDataUrl: await readFileAsBase64(i),
        duration: 0,
        data: { mediaSize: mediaSize },
      });
      let scaledMediaSize = scaleMediaSize(mediaSize);
      mapTracks[0].clips.push({
        id: nanoid(),
        mediaFileId: id,
        beginOffset: getTrackDuration(mapTracks[0].clips),
        duration: state.projectFPS * 3,
        composeSize: scaledMediaSize,
        composePos: [
          Math.floor((state.projectSize[0] - scaledMediaSize[0]) / 2),
          Math.floor((state.projectSize[1] - scaledMediaSize[1]) / 2),
        ],
        composeRotate: 0,
        artEffect: "none",
      });
    }
    progress[item].progress = "done";
    updateState({
      importProgress: progress,
    });
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
export const deleteMediaFile = (id: string) => {
  let state = store.getState().reducer;
  updateState({
    mediaFiles: (cloneDeep(state.mediaFiles) as MediaFile[]).filter(
      (i) => i.id !== id
    ),
    videoTrack: (cloneDeep(state.videoTrack) as VideoTrackClip[]).filter(
      (i) => i.mediaFileId !== id
    ),
    mapTracks: (cloneDeep(state.mapTracks) as MapTrackItem[]).map((tr) => ({
      ...tr,
      clips: tr.clips.filter((i) => i.mediaFileId !== id),
    })),
  });
};
export const deleteClip = (id: string) => {
  let state = store.getState().reducer;
  saveState();
  updateState({
    videoTrack: (cloneDeep(state.videoTrack) as VideoTrackClip[]).filter(
      (i) => i.id !== id
    ),
    mapTracks: (cloneDeep(state.mapTracks) as MapTrackItem[]).map((tr) => ({
      ...tr,
      clips: tr.clips.filter((i) => i.id !== id),
    })),
    subtitleTracks: (
      cloneDeep(state.subtitleTracks) as SubtitleTrackItem[]
    ).map((tr) => ({
      ...tr,
      clips: tr.clips.filter((i) => i.id !== id),
    })),
    selectedId: "",
  });
  alignTracks();
};

export const appendMapTrack = () => {
  const mapTracks = cloneDeep(
    store.getState().reducer.mapTracks
  ) as MapTrackItem[];
  const tracksSort = cloneDeep(store.getState().reducer.tracksSort) as string[];
  let id = nanoid();
  mapTracks.push({
    id: id,
    clips: [] as MapTrackClip[],
  } as MapTrackItem);
  tracksSort.unshift(`track_map_${id}`);
  updateState({
    mapTracks,
    tracksSort,
  });
};

export const appendSubtitleTrack = () => {
  const subtitleTracks = cloneDeep(
    store.getState().reducer.subtitleTracks
  ) as SubtitleTrackItem[];
  const tracksSort = cloneDeep(store.getState().reducer.tracksSort) as string[];
  let id = nanoid();
  subtitleTracks.push({
    id: id,
    clips: [] as SubtitleTrackClip[],
  } as SubtitleTrackItem);
  tracksSort.unshift(`track_subtitle_${id}`);
  updateState({
    subtitleTracks,
    tracksSort,
  });
};

export const removeTrack = (i: string) => {
  let id: string;
  if (i.indexOf("track_map") === 0) id = i.split("track_map_").at(-1)!;
  else id = i.split("track_subtitle_").at(-1)!;
  updateState({
    mapTracks: (
      cloneDeep(store.getState().reducer.mapTracks) as MapTrackItem[]
    ).filter((tr) => tr.id !== id),
    subtitleTracks: (
      cloneDeep(store.getState().reducer.subtitleTracks) as SubtitleTrackItem[]
    ).filter((tr) => tr.id !== id),
    tracksSort: (
      cloneDeep(store.getState().reducer.tracksSort) as string[]
    ).filter((tr) => tr.toString() !== i),
  });
};

export const alignTracks = () => {
  let state = store.getState().reducer;
  let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
  let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
  let subtitleTracks = cloneDeep(state.subtitleTracks) as SubtitleTrackItem[];
  let starts = [] as number[];
  if (videoTrack.length) starts.push(getTrackStart(videoTrack));
  for (let mapTrack of mapTracks)
    if (mapTrack.clips.length) starts.push(getTrackStart(mapTrack.clips));
  for (let subtitleTrack of subtitleTracks)
    if (subtitleTrack.clips.length)
      starts.push(getTrackStart(subtitleTrack.clips));
  let start = min(starts) as number;
  for (let i of videoTrack) i.beginOffset -= start;
  for (let i of mapTracks) for (let j of i.clips) j.beginOffset -= start;
  for (let i of subtitleTracks) for (let j of i.clips) j.beginOffset -= start;
  updateState({
    videoTrack,
    mapTracks,
    subtitleTracks,
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

export const scaleMediaSize: (
  mediaSize: [number, number]
) => [number, number] = (mediaSize: [number, number]) => {
  let state = store.getState().reducer;
  let w = mediaSize[0],
    h = mediaSize[1];
  if (w > state.projectSize[0]) {
    let tmpw = state.projectSize[0],
      tmph = (h * state.projectSize[0]) / w;
    w = tmpw;
    h = tmph;
  }
  if (h > state.projectSize[1]) {
    let tmph = state.projectSize[1],
      tmpw = (w * state.projectSize[1]) / h;
    w = tmpw;
    h = tmph;
  }
  return [Math.floor(w), Math.floor(h)];
};

export const setCurrentFrame = (frameNum: number) => {
  updateState({
    currentFrame: frameNum,
  });
};

let prevVideoHost = document.createElement("video");

export const composeFrame = async (
  frameNum: number,
  canvas: HTMLCanvasElement,
  forExport: boolean
) => {
  let state = store.getState().reducer;
  let composeCanvas = forExport ? canvas : document.createElement("canvas");
  composeCanvas.width = canvas.width;
  composeCanvas.height = canvas.height;
  let finalCtx = canvas.getContext("2d") as CanvasRenderingContext2D;
  let ctx = composeCanvas.getContext("2d") as CanvasRenderingContext2D;
  let tracksSort = cloneDeep(state.tracksSort).reverse();

  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, state.projectSize[0], state.projectSize[1]);

  for (let t of tracksSort) {
    ctx.restore();
    ctx.save();
    let trackId = t.toString();
    if (trackId === "track_video") {
      let videoTrack = state.videoTrack as VideoTrackClip[];
      let mediaFiles = state.mediaFiles as MediaFile[];
      let vid = videoTrack.find(
        (i) =>
          frameNum >= i.beginOffset &&
          frameNum <= i.beginOffset + i.duration - 1
      ) as VideoTrackClip;
      if (vid) {
        let mediaFile = mediaFiles.find(
          (i) => i.id === vid.mediaFileId
        ) as MediaFile;
        let mediaFrame = frameNum - vid.beginOffset + vid.mediaOffset;
        let videoHost = forExport
          ? document.createElement("video")
          : prevVideoHost;
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
    } else if (trackId.indexOf("track_map_") === 0) {
      let mapTracks = state.mapTracks as MapTrackItem[];
      let mapTrack = mapTracks.find(
        (i) => i.id === trackId.split("track_map_").at(-1)
      ) as MapTrackItem;
      let mediaFiles = state.mediaFiles as MediaFile[];
      let img = mapTrack.clips.find(
        (i) =>
          frameNum >= i.beginOffset &&
          frameNum <= i.beginOffset + i.duration - 1
      ) as MapTrackClip;
      if (img) {
        let mediaFile = mediaFiles.find(
          (i) => i.id === img.mediaFileId
        ) as MediaFile;
        let imgObj = new Image();
        await new Promise((res) => {
          imgObj.onload = res;
          imgObj.src = mediaFile.objectURL;
        });
        if (!MapArtRender({ ctx, img, imgObj })) {
          ctx.translate(
            img.composePos[0] + img.composeSize[0] / 2,
            img.composePos[1] + img.composeSize[1] / 2
          );
          ctx.rotate((img.composeRotate * Math.PI) / 180);
          ctx.drawImage(
            imgObj,
            -img.composeSize[0] / 2,
            -img.composeSize[1] / 2,
            img.composeSize[0],
            img.composeSize[1]
          );
        }
      }
    } else if (trackId.indexOf("track_subtitle_") === 0) {
      let subtitleTracks = state.subtitleTracks as SubtitleTrackItem[];
      let subtitleTrack = subtitleTracks.find(
        (i) => i.id === trackId.split("track_subtitle_").at(-1)
      ) as SubtitleTrackItem;
      let subtitle = subtitleTrack.clips.find(
        (i) =>
          frameNum >= i.beginOffset &&
          frameNum <= i.beginOffset + i.duration - 1
      ) as SubtitleTrackClip;
      if (subtitle) {
        if (
          !SubtitleArtRender({
            ctx,
            subtitle,
            frameNum,
            projectFPS: state.projectFPS,
          })
        ) {
          ctx.font = `${subtitle.fontSize}px  sans-serif`;
          ctx.textBaseline = "top";
          ctx.fillStyle = subtitle.color;
          ctx.fillText(
            subtitle.content,
            subtitle.composePos[0],
            subtitle.composePos[1]
          );
        }
      }
    }
  }
  if (!forExport && store.getState().reducer.currentFrame === frameNum)
    finalCtx.drawImage(composeCanvas, 0, 0);
};
export const composeCurrentFrame = () => {
  let state = store.getState().reducer;
  composeFrame(
    state.currentFrame,
    document.getElementById("canvas") as HTMLCanvasElement,
    false
  );
};
export const exportVideo = async () => {
  await initFF();
  let state = store.getState().reducer;
  const trackDuration = getTracksDuration();
  updateState({
    exporting: true,
    exportProgress: {
      framesCurrent: 0,
      framesTotal: trackDuration,
      audioGenerated: false,
    } as ExportProgress,
    ffmpegLogs: [],
  });
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
  let canvas = document.createElement("canvas");
  canvas.width = state.projectSize[0];
  canvas.height = state.projectSize[1];
  for (let i = 0; i < trackDuration; i++) {
    await composeFrame(i, canvas, true);
    let frame = new VideoFrame(canvas, {
      timestamp: (i * 1e6) / state.projectFPS,
    });
    videoEncoder.encode(frame, { keyFrame: i / state.projectFPS === 10 });
    frame.close();
    updateState({
      exporting: true,
      exportProgress: {
        framesCurrent: i + 1,
        framesTotal: trackDuration,
        audioGenerated: false,
      } as ExportProgress,
    });
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
    // insert silence between videos
    if (getTrackStart(videoTrack) > 0) {
      let silId = nanoid();
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
        `${getTrackStart(videoTrack) / fps}`,
        "-f",
        "mp4",
        `${silId}`
      );
      audioTrackArr.push({
        sil: false,
        fileName: silId,
      } as AudioTrackItem);
    }
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
      "mp4",
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
  updateState({
    exporting: true,
    exportProgress: {
      framesCurrent: trackDuration,
      framesTotal: trackDuration,
      audioGenerated: true,
    } as ExportProgress,
  });
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
  updateState({
    exporting: false,
  });
};
