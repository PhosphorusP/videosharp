import { useRef } from "react";
import { useSelector } from "react-redux";
import { composeCurrentFrame, getTrackDuration, setCurrentFrame } from "../store/action";
import VideoTrackClip from "./VideoTrackClip";

const Timeline: React.FC = () => {
  const padding = 16;
  const state: any = useSelector((state: any) => state.reducer);
  const rulerRef = useRef(null);
  const trackDuration = getTrackDuration(state.videoTrack);
  const timelineDragHandler = (e: MouseEvent) => {
    let offsetX =
      Math.round(
        e.clientX - (rulerRef.current as unknown as HTMLElement).offsetLeft
      ) / state.timelineRatio;
    if (e.buttons && offsetX <= trackDuration - 1)
      setCurrentFrame(Math.round(offsetX));
  };
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
          width: `${trackDuration ? (trackDuration - 1) * state.timelineRatio : 0}px`,
          backgroundColor: "red",
          borderRadius: "4px",
        }}
        onMouseDown={timelineDragHandler as any}
        onMouseMove={timelineDragHandler as any}
      />
      <div style={{ whiteSpace: "nowrap", position: "relative" }}>
        {state.videoTrack.map(
          (videoTrackItem: VideoTrackItem) => (
            <VideoTrackClip
              key={videoTrackItem.id}
              videoTrackItem={videoTrackItem}
            />
          )
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: `${padding + state.currentFrame * state.timelineRatio}px`,
          top: "0px",
          width: "1px",
          height: "100%",
          backgroundColor: "#0F0",
        }}
      ></div>
    </div>
  );
};
export default Timeline;
