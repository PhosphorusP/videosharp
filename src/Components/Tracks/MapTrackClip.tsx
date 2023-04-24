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

type MapTrackClipProps = {
  mapTrack: MapTrackItem;
  mapTrackClip: MapTrackClip;
};
const MapTrackClip: React.FC<MapTrackClipProps> = ({
  mapTrack,
  mapTrackClip,
}: MapTrackClipProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [tmpMapTrack, setTmpMapTrack] = useState({} as MapTrackItem);
  const handleWidth = 8;
  const offsetLeft =
    mapTrackClip.beginOffset * state.timelineRatio +
    (state.timelineCollapsed ? 28 : 56);
  const { token } = theme.useToken();
  const clipWidth =
    (mapTrackClip.duration -
      (mapTrackClip.beginOffset + (mapTrackClip.duration as number) ===
      getTrackDuration(mapTrack.clips)
        ? 1
        : 0)) *
    state.timelineRatio;
  const dragStartHandler = (e: React.MouseEvent, operation: string) => {
    e.stopPropagation();
    setMousePos([e.clientX, e.clientY]);
    setTmpMapTrack(mapTrack);
    saveState();
    updateState({
      clipOrigin: `${mapTrackClip.id}_${operation}`,
    });
  };
  const { show: showContextMenu } = useContextMenu({
    id: mapTrack.id,
  });
  useEffect(() => {
    let mouseMoveHandler: any = (e: React.MouseEvent) => {
      if (state.clipOrigin === `${mapTrackClip.id}_move`) {
        e.stopPropagation();
        if (e.buttons) {
          let mapTrackClips = cloneDeep(tmpMapTrack).clips;
          let currentClip = mapTrackClips.find(
            (i) => i.id === mapTrackClip.id
          ) as MapTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            mapTrackClips
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
          let nextClips = mapTrackClips.filter(
            (i) => i.beginOffset > currentClip.beginOffset
          );
          if (nextClips.length) {
            let nextOffset =
              getTrackStart(nextClips) -
              (currentClip.beginOffset + currentClip.duration);
            if (nextOffset < 0)
              nextClips.map((i) => (i.beginOffset -= nextOffset));
          }

          let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
          mapTracks.find((i) => i.id === mapTrack.id)!.clips = mapTrackClips;
          updateState({
            mapTracks: mapTracks,
          });
        }
      } else if (state.clipOrigin === `${mapTrackClip.id}_clip_l`) {
        e.stopPropagation();
        if (e.buttons) {
          let mapTrackClips = cloneDeep(tmpMapTrack).clips;
          let currentClip = mapTrackClips.find(
            (i) => i.id === mapTrackClip.id
          ) as MapTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            offset[0] > currentClip.duration - handleWidth * 4 ||
            mapTrackClips.filter(
              (i) =>
                i.beginOffset < currentClip.beginOffset &&
                i.beginOffset + i.duration - 1 >=
                  currentClip.beginOffset + offset[0]
            ).length
          )
            return;
          currentClip.beginOffset += offset[0];
          currentClip.duration -= offset[0];

          let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
          mapTracks.find((i) => i.id === mapTrack.id)!.clips = mapTrackClips;
          updateState({
            mapTracks: mapTracks,
          });
        }
      } else if (state.clipOrigin === `${mapTrackClip.id}_clip_r`) {
        e.stopPropagation();
        if (e.buttons) {
          let mapTrackClips = cloneDeep(tmpMapTrack).clips;
          let currentClip = mapTrackClips.find(
            (i) => i.id === mapTrackClip.id
          ) as MapTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          let mediaFile = (state.mediaFiles as MediaFile[]).find(
            (i: MediaFile) => i.id === currentClip.mediaFileId
          )!;
          if (currentClip.duration + offset[0] < handleWidth * 4) return;
          currentClip.duration += offset[0];
          let nextClips = mapTrackClips.filter(
            (i) => i.beginOffset > currentClip.beginOffset
          );
          if (nextClips.length) {
            let nextOffset =
              getTrackStart(nextClips) -
              (currentClip.beginOffset + currentClip.duration);
            if (nextOffset < 0)
              nextClips.map((i) => (i.beginOffset -= nextOffset));
          }
          let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
          mapTracks.find((i) => i.id === mapTrack.id)!.clips = mapTrackClips;
          updateState({
            mapTracks: mapTracks,
          });
        }
      }
    };
    document.addEventListener("mousemove", mouseMoveHandler);
    let mouseUpHandler: any = () => {
      if (
        [
          `${mapTrackClip.id}_move`,
          `${mapTrackClip.id}_clip_l`,
          `${mapTrackClip.id}_clip_r`,
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
              (i: MediaFile) => i.id === mapTrackClip.mediaFileId
            ).fileName
          }
        </div>
      )}
      <div
        key={mapTrackClip.id}
        style={{
          position: "absolute",
          top: state.timelineCollapsed ? 0 : "16px",
          left: `${offsetLeft}px`,

          display: "inline-block",
          boxSizing: "border-box",
          boxShadow:
            state.selectedId === mapTrackClip.id && !state.timelineCollapsed
              ? `0 4px 0 ${handleColor} inset, 0 -4px 0 ${handleColor} inset`
              : undefined,
          height: state.timelineCollapsed ? "28px" : "56px",
          width: `${clipWidth}px`,
          backgroundImage: `url(${
            state.mediaFiles.find(
              (i: MediaFile) => i.id === mapTrackClip.mediaFileId
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
            selectedId: mapTrackClip.id,
          });
        }}
        onContextMenu={(e) =>
          showContextMenu({ event: e, props: { id: mapTrackClip.id } })
        }
      ></div>
      {state.selectedId === mapTrackClip.id ? (
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
          ></div>
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
export default MapTrackClip;
