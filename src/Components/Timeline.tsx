import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  composeCurrentFrame,
  getTrackDuration,
  setCurrentFrame,
  updateState,
} from "../store/action";
import VideoTrackClip from "./VideoTrackClip";

const Timeline: React.FC = () => {
  const padding = 16;
  const state: any = useSelector((state: any) => state.reducer);
  const rulerRef = useRef(null);
  const trackDuration = getTrackDuration(state.videoTrack);
  const timelineDragHandler: any = (e: React.MouseEvent) => {
    if (state.dragOrigin === "timeline") {
      let offsetX =
        Math.round(
          e.clientX - (rulerRef.current as unknown as HTMLElement).offsetLeft
        ) / state.timelineRatio;
      if (e.buttons && offsetX <= trackDuration - 1 && offsetX >= 0)
        setCurrentFrame(Math.round(offsetX));
    }
  };
  const timelineDragEndHandler: any = () => {
    console.log("mouseup");
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
      }}
    >
      <div
        ref={rulerRef}
        style={{
          height: "16px",
          width: `${
            trackDuration ? (trackDuration - 1) * state.timelineRatio : 0
          }px`,
          backgroundColor: "red",
          borderRadius: "4px",
        }}
        onMouseDown={() =>
          updateState({
            dragOrigin: "timeline",
          })
        }
        //onMouseMove={timelineDragHandler}
      />
      <div style={{ whiteSpace: "nowrap", position: "relative" }}>
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
          backgroundColor: "#0F0",
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
};
export default Timeline;
