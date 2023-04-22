import { EllipsisOutlined } from "@ant-design/icons";
import { cloneDeep } from "lodash-es";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  alignTracks,
  getTrackDuration,
  getTrackStart,
  updateState,
} from "../store/action";

type VideoTrackClipProps = {
  videoTrackItem: VideoTrackItem;
};
const VideoTrackClip: React.FC<VideoTrackClipProps> = ({
  videoTrackItem,
}: VideoTrackClipProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [tmpVideoTrack, setTmpVideoTrack] = useState([] as VideoTrackItem[]);
  const handleWidth = 8;
  const clipWidth =
    (videoTrackItem.duration -
      (videoTrackItem.beginOffset + (videoTrackItem.duration as number) ===
      getTrackDuration(state.videoTrack)
        ? 1
        : 0)) *
    state.timelineRatio;
  const dragStartHandler = (e: React.MouseEvent, operation: string) => {
    setMousePos([e.clientX, e.clientY]);
    setTmpVideoTrack(state.videoTrack);
    updateState({
      dragOrigin: `${videoTrackItem.id}_${operation}`,
    });
  };
  useEffect(() => {
    let mouseMoveHandler: any = (e: React.MouseEvent) => {
      if (state.dragOrigin === `${videoTrackItem.id}_move`) {
        e.stopPropagation();
        if (e.buttons) {
          let videoTrack = cloneDeep(tmpVideoTrack);
          let currentClip = videoTrack.find(
            (i) => i.id === videoTrackItem.id
          ) as VideoTrackItem;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            videoTrack
              .filter((i) => i.id !== currentClip.id)
              .filter(
                (i) =>
                  i.beginOffset < currentClip.beginOffset &&
                  i.beginOffset + i.duration - 1 >=
                    currentClip.beginOffset + offset[0]
              ).length
          )
            return;
          currentClip.beginOffset += offset[0];
          let nextClips = videoTrack.filter(
            (i) => i.beginOffset > currentClip.beginOffset
          );
          if (nextClips.length) {
            let nextOffset =
              getTrackStart(nextClips) -
              (currentClip.beginOffset + currentClip.duration);
            if (nextOffset < 0)
              nextClips.map((i) => (i.beginOffset -= nextOffset));
          }

          updateState({
            videoTrack: videoTrack,
          });
        }
      } else if (state.dragOrigin === `${videoTrackItem.id}_clip_l`) {
        e.stopPropagation();
        if (e.buttons) {
          let videoTrack = cloneDeep(tmpVideoTrack);
          let currentClip = videoTrack.find(
            (i) => i.id === videoTrackItem.id
          ) as VideoTrackItem;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            currentClip.mediaOffset + offset[0] < 0 ||
            offset[0] >
              currentClip.duration -
                handleWidth * 4 ||
            videoTrack.filter(
              (i) =>
                i.beginOffset < currentClip.beginOffset &&
                i.beginOffset + i.duration - 1 >=
                  currentClip.beginOffset + offset[0]
            ).length
          )
            return;
          currentClip.beginOffset += offset[0];
          currentClip.mediaOffset += offset[0];
          currentClip.duration -= offset[0];
          updateState({
            videoTrack: videoTrack,
          });
        }
      } else if (state.dragOrigin === `${videoTrackItem.id}_clip_r`) {
        e.stopPropagation();
        if (e.buttons) {
          let videoTrack = cloneDeep(tmpVideoTrack);
          let currentClip = videoTrack.find(
            (i) => i.id === videoTrackItem.id
          ) as VideoTrackItem;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          let mediaFile = (state.mediaFiles as MediaFile[]).find(
            (i: MediaFile) => i.id === currentClip.mediaFileId
          )!;
          if (
            currentClip.duration + offset[0] < handleWidth * 4 ||
            currentClip.mediaOffset + currentClip.duration + offset[0] >
              mediaFile.duration
          )
            return;
          currentClip.duration += offset[0];
          let nextClips = videoTrack.filter(
            (i) => i.beginOffset > currentClip.beginOffset
          );
          if (nextClips.length) {
            let nextOffset =
              getTrackStart(nextClips) -
              (currentClip.beginOffset + currentClip.duration);
            if (nextOffset < 0)
              nextClips.map((i) => (i.beginOffset -= nextOffset));
          }
          updateState({
            videoTrack: videoTrack,
          });
        }
      }
    };
    document.addEventListener("mousemove", mouseMoveHandler);
    let mouseUpHandler: any = () => {
      if (
        [
          `${videoTrackItem.id}_move`,
          `${videoTrackItem.id}_clip_l`,
          `${videoTrackItem.id}_clip_r`,
        ].indexOf(state.dragOrigin) >= 0
      ) {
        alignTracks();
        updateState({
          dragOrigin: "",
        });
      }
    };
    document.addEventListener("mouseup", mouseUpHandler);
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${videoTrackItem.beginOffset * state.timelineRatio}px`,
          height: "14px",
          width: `${clipWidth}px`,
          lineHeight: "14px",
          fontSize: "12px",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {
          state.mediaFiles.find(
            (i: MediaFile) => i.id === videoTrackItem.mediaFileId
          ).fileName
        }
      </div>
      <div
        key={videoTrackItem.id}
        style={{
          position: "absolute",
          top: "14px",
          left: `${videoTrackItem.beginOffset * state.timelineRatio}px`,

          display: "inline-block",
          boxSizing: "border-box",
          boxShadow:
            state.selectedId === videoTrackItem.id
              ? "0 2px 0 #000 inset, 0 -2px 0 #000 inset"
              : undefined,
          height: "56px",
          width: `${clipWidth}px`,
          backgroundImage: `url(${
            state.mediaFiles.find(
              (i: MediaFile) => i.id === videoTrackItem.mediaFileId
            ).thumbnailDataUrl
          })`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "left center",
          borderRadius: "8px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "12px",
        }}
        onMouseDown={(e) => {
          dragStartHandler(e, "move");
          updateState({
            selectedId: videoTrackItem.id,
          });
          e.stopPropagation();
        }}
      ></div>
      {state.selectedId === videoTrackItem.id ? (
        <>
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: `${videoTrackItem.beginOffset * state.timelineRatio}px`,
              width: `${handleWidth}px`,
              height: "56px",
              backgroundColor: "#000",
              borderRadius: "8px 0 0 8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <EllipsisOutlined rotate={90} style={{ color: "#fff" }} />
          </div>
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: `${
                videoTrackItem.beginOffset * state.timelineRatio -
                handleWidth / 2
              }px`,
              width: `${handleWidth * 2}px`,
              height: "56px",
              cursor: "ew-resize",
            }}
            onMouseDown={(e) => dragStartHandler(e, "clip_l")}
          />
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: `${
                videoTrackItem.beginOffset * state.timelineRatio +
                clipWidth -
                handleWidth
              }px`,
              width: `${handleWidth}px`,
              height: "56px",
              backgroundColor: "#000",
              borderRadius: "0 8px 8px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <EllipsisOutlined rotate={90} style={{ color: "#fff" }} />
          </div>
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: `${
                videoTrackItem.beginOffset * state.timelineRatio +
                clipWidth -
                handleWidth -
                handleWidth / 2
              }px`,
              width: `${handleWidth * 2}px`,
              height: "56px",
              cursor: "ew-resize",
            }}
            onMouseDown={(e) => dragStartHandler(e, "clip_r")}
          />
        </>
      ) : undefined}
    </>
  );
};
export default VideoTrackClip;
