import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  composeCurrentFrame,
  getTrackDuration,
  setCurrentFrame,
  updateState,
} from "../store/action";
import { theme } from "antd";
import VideoTrackClip from "./VideoTrackClip";

const Timeline: React.FC = () => {
  const padding = 2;
  const { token } = theme.useToken();
  const state: any = useSelector((state: any) => state.reducer);
  const rulerRef = useRef(null);
  const trackDuration = getTrackDuration(state.videoTrack);
  const timelineDragHandler: any = (e: React.MouseEvent) => {
    if (state.dragOrigin === "timeline") {
      let offsetX =
        Math.round(
          e.clientX -
            (rulerRef.current as unknown as HTMLElement).getBoundingClientRect()
              .x
        ) / state.timelineRatio;
      if (e.buttons && offsetX <= trackDuration - 1 && offsetX >= 0)
        setCurrentFrame(Math.round(offsetX));
    }
  };
  const timelineDragEndHandler: any = () => {
    if (state.dragOrigin === "timeline")
      updateState({
        dragOrigin: "",
      });
  };
  useEffect(() => {
    document.addEventListener("mousemove", timelineDragHandler);
    document.addEventListener("mouseup", timelineDragEndHandler);
    return () => {
      document.removeEventListener("mousemove", timelineDragHandler);
      document.removeEventListener("mouseup", timelineDragEndHandler);
    };
  });
  if (trackDuration) composeCurrentFrame();
  return (
    <div
      style={{
        flex: 1,
        overflowX: "scroll",
        display: "flex",
        flexDirection: "column",
        paddingLeft: `${padding}px`,
        paddingRight: `${padding}px`,
        paddingBottom: "2px",
        position: "relative",
      }}
      onMouseDown={() => updateState({ selectedId: "" })}
    >
      <div
        ref={rulerRef}
        style={{
          boxSizing: "border-box",
          height: "18px",
          width: `${
            trackDuration ? (trackDuration - 1) * state.timelineRatio : 0
          }px`,
          backgroundColor: token.colorBorderBg,
          borderLeft: `1px solid ${token.colorBorderSecondary}`,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: "0 0 2px 2px",
          marginBottom: "4px",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          updateState({
            dragOrigin: "timeline",
          });
        }}
      >
        {new Array(
          Math.ceil((trackDuration ? trackDuration - 1 : 0) / state.projectFPS)
        )
          .fill("")
          .map((i, index) => (
            <div key={index}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${
                    index * state.projectFPS * state.timelineRatio - 1
                  }px`,
                  width: "1px",
                  height: "17px",
                  background: token.colorBorderSecondary,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${
                    index * state.projectFPS * state.timelineRatio + 2
                  }px`,
                  height: "16px",
                  fontSize: "12px",
                  lineHeight: "16px",
                  color:
                    Math.floor(state.currentFrame / state.projectFPS) === index
                      ? token.colorPrimary
                      : token.colorTextSecondary,
                  transformOrigin: "left",
                  transform: "scale(0.75)",
                }}
              >
                {index}s
              </div>
            </div>
          ))}
      </div>
      <div
        style={{
          whiteSpace: "nowrap",
          position: "relative",
          height: state.timelineCollapsed ? `${28}px` : `${56 + 16}px`,
        }}
      >
        {state.videoTrack.map((videoTrackItem: VideoTrackItem) => (
          <VideoTrackClip
            key={videoTrackItem.id}
            videoTrackItem={videoTrackItem}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: `${padding + state.currentFrame * state.timelineRatio}px`,
          top: "0px",
          width: "1px",
          height: "100%",
          backgroundColor: token.colorPrimary,
          boxShadow: `0 0 8px ${token.colorPrimary}`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${8 / Math.sqrt(3)}px solid transparent`,
            borderRight: `${8 / Math.sqrt(3)}px solid transparent`,
            borderTop: `${8}px solid ${token.colorPrimary}`,
            //border: "8px solid",
            //borderColor: `red transparent transparent transparent`,
            filter: `drop-shadow(0 0 8px ${token.colorPrimary})`,
            transform: "translateX(-4px)",
          }}
        ></div>
      </div>
    </div>
  );
};
export default Timeline;
