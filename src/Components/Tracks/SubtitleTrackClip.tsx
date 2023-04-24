import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { Popover, theme } from "antd";
import { cloneDeep } from "lodash-es";
import { useEffect, useState } from "react";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useSelector } from "react-redux";
import {
  alignTracks,
  formatTimestamp,
  getTrackDuration,
  getTrackStart,
  saveState,
  updateState,
} from "../../store/action";
import { nanoid } from "nanoid";

type SubtitleTrackClipProps = {
  subtitleTrack: SubtitleTrackItem;
  subtitleTrackClip: SubtitleTrackClip;
};
const SubtitleTrackClip: React.FC<SubtitleTrackClipProps> = ({
  subtitleTrack,
  subtitleTrackClip,
}: SubtitleTrackClipProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [tmpSubtitleTrack, setTmpSubtitleTrack] = useState(
    {} as SubtitleTrackItem
  );
  const handleWidth = 8;
  const offsetLeft =
    subtitleTrackClip.beginOffset * state.timelineRatio +
    (state.timelineCollapsed ? 28 : 56);
  const { token } = theme.useToken();
  const clipWidth =
    (subtitleTrackClip.duration -
      (subtitleTrackClip.beginOffset +
        (subtitleTrackClip.duration as number) ===
      getTrackDuration(subtitleTrack.clips)
        ? 1
        : 0)) *
    state.timelineRatio;
  const dragStartHandler = (e: React.MouseEvent, operation: string) => {
    e.stopPropagation();
    setMousePos([e.clientX, e.clientY]);
    setTmpSubtitleTrack(subtitleTrack);
    saveState();
    updateState({
      clipOrigin: `${subtitleTrackClip.id}_${operation}`,
    });
  };
  const { show: showContextMenu } = useContextMenu({
    id: subtitleTrack.id,
  });
  useEffect(() => {
    let mouseMoveHandler: any = (e: React.MouseEvent) => {
      if (subtitleTrackClip.id === "new") return;
      if (state.clipOrigin === `${subtitleTrackClip.id}_move`) {
        e.stopPropagation();
        if (e.buttons) {
          let subtitleTrackClips = cloneDeep(tmpSubtitleTrack).clips;
          let currentClip = subtitleTrackClips.find(
            (i) => i.id === subtitleTrackClip.id
          ) as SubtitleTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            subtitleTrackClips
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
          let nextClips = subtitleTrackClips.filter(
            (i) => i.beginOffset > currentClip.beginOffset
          );
          if (nextClips.length) {
            let nextOffset =
              getTrackStart(nextClips) -
              (currentClip.beginOffset + currentClip.duration);
            if (nextOffset < 0)
              nextClips.map((i) => (i.beginOffset -= nextOffset));
          }

          let subtitleTracks = cloneDeep(
            state.subtitleTracks
          ) as SubtitleTrackItem[];
          subtitleTracks.find((i) => i.id === subtitleTrack.id)!.clips =
            subtitleTrackClips;
          updateState({
            subtitleTracks,
          });
        }
      } else if (state.clipOrigin === `${subtitleTrackClip.id}_clip_l`) {
        e.stopPropagation();
        if (e.buttons) {
          let subtitleTrackClips = cloneDeep(tmpSubtitleTrack).clips;
          let currentClip = subtitleTrackClips.find(
            (i) => i.id === subtitleTrackClip.id
          ) as SubtitleTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (
            offset[0] > currentClip.duration - handleWidth * 3 ||
            subtitleTrackClips.filter(
              (i) =>
                i.beginOffset < currentClip.beginOffset &&
                i.beginOffset + i.duration - 1 >=
                  currentClip.beginOffset + offset[0]
            ).length
          )
            return;
          currentClip.beginOffset += offset[0];
          currentClip.duration -= offset[0];

          let subtitleTracks = cloneDeep(
            state.subtitleTracks
          ) as SubtitleTrackItem[];
          subtitleTracks.find((i) => i.id === subtitleTrack.id)!.clips =
            subtitleTrackClips;
          updateState({
            subtitleTracks,
          });
        }
      } else if (state.clipOrigin === `${subtitleTrackClip.id}_clip_r`) {
        e.stopPropagation();
        if (e.buttons) {
          let subtitleTrackClips = cloneDeep(tmpSubtitleTrack).clips;
          let currentClip = subtitleTrackClips.find(
            (i) => i.id === subtitleTrackClip.id
          ) as SubtitleTrackClip;
          let offset = [
            Math.round((e.clientX - mousePos[0]) / state.timelineRatio),
            Math.round((e.clientY - mousePos[1]) / state.timelineRatio),
          ];
          if (currentClip.duration + offset[0] < handleWidth * 3) return;
          currentClip.duration += offset[0];
          let nextClips = subtitleTrackClips.filter(
            (i) => i.beginOffset > currentClip.beginOffset
          );
          if (nextClips.length) {
            let nextOffset =
              getTrackStart(nextClips) -
              (currentClip.beginOffset + currentClip.duration);
            if (nextOffset < 0)
              nextClips.map((i) => (i.beginOffset -= nextOffset));
          }
          let subtitleTracks = cloneDeep(
            state.subtitleTracks
          ) as SubtitleTrackItem[];
          subtitleTracks.find((i) => i.id === subtitleTrack.id)!.clips =
            subtitleTrackClips;
          updateState({
            subtitleTracks,
          });
        }
      }
    };
    document.addEventListener("mousemove", mouseMoveHandler);
    let mouseUpHandler: any = () => {
      if (
        [
          `${subtitleTrackClip.id}_move`,
          `${subtitleTrackClip.id}_clip_l`,
          `${subtitleTrackClip.id}_clip_r`,
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
          {subtitleTrackClip.id === "new" || subtitleTrackClip.beginOffset < 0
            ? undefined
            : formatTimestamp(subtitleTrackClip.beginOffset, state.projectFPS)}
        </div>
      )}
      <div
        key={subtitleTrackClip.id}
        style={{
          position: "absolute",
          top: state.timelineCollapsed ? 0 : "16px",
          left: `${offsetLeft}px`,

          display: "inline-block",
          boxSizing: "border-box",
          boxShadow:
            state.selectedId === subtitleTrackClip.id &&
            !state.timelineCollapsed
              ? `0 4px 0 ${handleColor} inset, 0 -4px 0 ${handleColor} inset`
              : undefined,
          height: state.timelineCollapsed ? "28px" : "56px",
          width: `${clipWidth}px`,
          background:
            subtitleTrackClip.id === "new"
              ? token.colorFillSecondary
              : "linear-gradient(#9254de, #722ed1)",
          borderRadius: "8px",
          padding: "0 4px",
          lineHeight: state.timelineCollapsed ? "28px" : "56px",
          color: token.colorTextLightSolid,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        onMouseDown={(e) => {
          if (subtitleTrackClip.id === "new") return;
          e.stopPropagation();
          dragStartHandler(e, "move");
          updateState({
            selectedId: subtitleTrackClip.id,
          });
        }}
        onContextMenu={(e) =>
          showContextMenu({ event: e, props: { id: subtitleTrackClip.id } })
        }
      >
        {subtitleTrackClip.content}
      </div>
      {state.selectedId === subtitleTrackClip.id ? (
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
      {subtitleTrackClip.id === "new" ? (
        <Popover content="添加新字幕">
          <div
            style={{
              position: "absolute",
              top: state.timelineCollapsed ? 0 : "20px",
              left: `${offsetLeft}px`,
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              boxSizing: "border-box",
              height: state.timelineCollapsed ? "28px" : "52px",
              width: `${clipWidth}px`,
              borderRadius: "8px",
              zIndex: 1,
            }}
            onClick={() => {
              let tmpSubtitleTracks = cloneDeep(
                state.subtitleTracks
              ) as SubtitleTrackItem[];
              let tmpSubtitleTrack = tmpSubtitleTracks.find(
                (i) => i.id === subtitleTrack.id
              ) as SubtitleTrackItem;
              tmpSubtitleTrack.clips.push({
                id: nanoid(),
                mediaFileId: "",
                beginOffset: getTrackDuration(subtitleTrack.clips),
                duration: state.projectFPS * 1,
                composePos: [8, 8],
                content: "选中以替换字幕内容",
                fontSize: 32,
                color: "#222",
                backgroundColor: "",
              } as SubtitleTrackClip);
              saveState();
              updateState({ subtitleTracks: tmpSubtitleTracks });
            }}
          >
            <PlusOutlined
              style={{ fontSize: state.timelineCollapsed ? "12px" : "18px" }}
            />
          </div>
        </Popover>
      ) : undefined}
    </>
  );
};
export default SubtitleTrackClip;
