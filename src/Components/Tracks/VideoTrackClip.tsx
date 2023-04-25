import { EllipsisOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { cloneDeep } from "lodash-es";
import { useEffect, useState } from "react";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useSelector } from "react-redux";
import {
  alignTracks,
  getTrackDuration,
  getTrackStart,
  saveState,
  updateState,
} from "../../store/action";

type VideoTrackClipProps = {
  videoTrackClip: VideoTrackClip;
  trackId: string;
};
const VideoTrackClip: React.FC<VideoTrackClipProps> = ({
  videoTrackClip,
  trackId,
}: VideoTrackClipProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [tmpVideoTrack, setTmpVideoTrack] = useState([] as VideoTrackClip[]);
  const handleWidth = 8;
  const offsetLeft =
    videoTrackClip.beginOffset * state.timelineRatio +
    (state.timelineCollapsed ? 28 : 56);
  const { token } = theme.useToken();
  const clipWidth =
    (videoTrackClip.duration -
      (videoTrackClip.beginOffset + (videoTrackClip.duration as number) ===
      getTrackDuration(state.videoTrack)
        ? 1
        : 0)) *
    state.timelineRatio;
  const dragStartHandler = (e: React.MouseEvent, operation: string) => {
    e.stopPropagation();
    setMousePos([e.clientX, e.clientY]);
    setTmpVideoTrack(state.videoTrack);
    saveState();
    updateState({
      clipOrigin: `${videoTrackClip.id}_${operation}`,
    });
  };
  const { show: showContextMenu } = useContextMenu({
    id: "contextmenu_clips",
  });
  useEffect(() => {
    let mouseMoveHandler: any = (e: React.MouseEvent) => {
      if (state.clipOrigin === `${videoTrackClip.id}_move`) {
        e.stopPropagation();
        if (e.buttons) {
          let videoTrack = cloneDeep(tmpVideoTrack);
          let currentClip = videoTrack.find(
            (i) => i.id === videoTrackClip.id
          ) as VideoTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            videoTrack
              .filter((i) => i.id !== currentClip.id)
              .filter(
                (i) =>
                  i.beginOffset < currentClip.beginOffset + offset[0] &&
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
            videoTrack,
          });
        }
      } else if (state.clipOrigin === `${videoTrackClip.id}_clip_l`) {
        e.stopPropagation();
        if (e.buttons) {
          let videoTrack = cloneDeep(tmpVideoTrack);
          let currentClip = videoTrack.find(
            (i) => i.id === videoTrackClip.id
          ) as VideoTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            currentClip.mediaOffset + offset[0] < 0 ||
            offset[0] > currentClip.duration - handleWidth * 3 ||
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
            videoTrack,
          });
        }
      } else if (state.clipOrigin === `${videoTrackClip.id}_clip_r`) {
        e.stopPropagation();
        if (e.buttons) {
          let videoTrack = cloneDeep(tmpVideoTrack);
          let currentClip = videoTrack.find(
            (i) => i.id === videoTrackClip.id
          ) as VideoTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          let mediaFile = (state.mediaFiles as MediaFile[]).find(
            (i: MediaFile) => i.id === currentClip.mediaFileId
          )!;
          if (
            currentClip.duration + offset[0] < handleWidth * 3 ||
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
            videoTrack,
          });
        }
      }
    };
    document.addEventListener("mousemove", mouseMoveHandler);
    let mouseUpHandler: any = () => {
      if (
        [
          `${videoTrackClip.id}_move`,
          `${videoTrackClip.id}_clip_l`,
          `${videoTrackClip.id}_clip_r`,
        ].indexOf(state.clipOrigin) >= 0
      ) {
        alignTracks();
        updateState({
          clipOrigin: "",
        });
      }
    };
    document.addEventListener("mouseup", mouseUpHandler);
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  });
  const handleColor = token.colorBgBase;
  const handleInnerColor = token.colorPrimary;
  return (
    <>
      {state.timelineCollapsed ? undefined : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${offsetLeft}px`,
            height: "14px",
            width: `${clipWidth}px`,
            lineHeight: "14px",
            fontSize: "12px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            color: token.colorTextSecondary,
          }}
        >
          {
            state.mediaFiles.find(
              (i: MediaFile) => i.id === videoTrackClip.mediaFileId
            ).fileName
          }
        </div>
      )}
      <div
        key={videoTrackClip.id}
        style={{
          position: "absolute",
          top: state.timelineCollapsed ? 0 : "16px",
          left: `${offsetLeft}px`,

          display: "inline-block",
          boxSizing: "border-box",
          boxShadow:
            state.selectedId === videoTrackClip.id && !state.timelineCollapsed
              ? `0 4px 0 ${handleColor} inset, 0 -4px 0 ${handleColor} inset`
              : undefined,
          height: state.timelineCollapsed ? "28px" : "56px",
          width: `${clipWidth}px`,
          backgroundImage: `url(${
            state.mediaFiles.find(
              (i: MediaFile) => i.id === videoTrackClip.mediaFileId
            ).thumbnailDataUrl
          })`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "left center",
          borderRadius: "8px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          dragStartHandler(e, "move");
          updateState({
            selectedId: videoTrackClip.id,
          });
        }}
        onContextMenu={(e) =>
          showContextMenu({ event: e, props: { id: videoTrackClip.id } })
        }
      />
      {state.selectedId === videoTrackClip.id ? (
        <>
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: state.timelineCollapsed ? 0 : "16px",
              left: `${offsetLeft}px`,
              display: "inline-block",
              boxSizing: "border-box",
              outline: `2px solid ${token.colorPrimary}`,
              height: state.timelineCollapsed ? "28px" : "56px",
              width: `${clipWidth}px`,
              borderRadius: "8px",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: state.timelineCollapsed ? 0 : "16px",
              left: `${offsetLeft}px`,
              width: `${handleWidth}px`,
              height: state.timelineCollapsed ? "28px" : "56px",
              backgroundColor: `${handleColor}`,
              borderRadius: "8px 0 0 8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <EllipsisOutlined
              rotate={90}
              style={{ color: handleInnerColor, fontSize: "20px" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: state.timelineCollapsed ? 0 : "16px",
              left: `${offsetLeft - handleWidth / 2}px`,
              width: `${handleWidth * 2}px`,
              height: state.timelineCollapsed ? "28px" : "56px",
              cursor: "ew-resize",
            }}
            onMouseDown={(e) => dragStartHandler(e, "clip_l")}
          />
          <div
            style={{
              position: "absolute",
              top: state.timelineCollapsed ? 0 : "16px",
              left: `${offsetLeft + clipWidth - handleWidth}px`,
              width: `${handleWidth}px`,
              height: state.timelineCollapsed ? "28px" : "56px",
              backgroundColor: `${handleColor}`,
              borderRadius: "0 8px 8px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <EllipsisOutlined
              rotate={90}
              style={{ color: handleInnerColor, fontSize: "20px" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: state.timelineCollapsed ? 0 : "16px",
              left: `${
                offsetLeft + clipWidth - handleWidth - handleWidth / 2
              }px`,
              width: `${handleWidth * 2}px`,
              height: state.timelineCollapsed ? "28px" : "56px",
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
