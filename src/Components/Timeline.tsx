import { useRef } from "react";
import { useSelector } from "react-redux";
import { composeCurrentFrame, setCurrentFrame } from "../store/action";

const Timeline: React.FC = () => {
  const padding = 16;
  const state: any = useSelector((state: any) => state.reducer);
  const rulerRef = useRef(null);
  const trackDuration = state.videoTrack.length
    ? state.videoTrack.reduce(
        (prev: number, cur: VideoTrackItem) => prev + cur.duration,
        0
      )
    : 0;
  const timelineDragHandler = (e: MouseEvent) => {
    let offsetX =
      Math.round(
        e.clientX - (rulerRef.current as unknown as HTMLElement).offsetLeft
      ) / 2;
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
          width: `${trackDuration ? (trackDuration - 1) * 2 : 0}px`,
          backgroundColor: "red",
          borderRadius: "4px",
        }}
        onMouseDown={timelineDragHandler as any}
        onMouseMove={timelineDragHandler as any}
      />
      <div style={{ whiteSpace: "nowrap" }}>
        {state.videoTrack.map(
          (videoTrackItem: VideoTrackItem, itemIndex: number) => (
            <div
              key={videoTrackItem.id}
              style={{
                display: "inline-block",
                height: "56px",
                width: `${
                  (videoTrackItem.duration -
                    (itemIndex === state.videoTrack.length - 1 ? 1 : 0)) *
                  2
                }px`,
                backgroundColor: "#666",
                backgroundImage: `url(${
                  state.mediaFiles.find(
                    (i: MediaFile) => i.id === videoTrackItem.mediaFileId
                  ).thumbnailDataUrl
                })`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "left center",
                color: "#FFF",
                textShadow: "0 2px 4px #000",
                borderRadius: "8px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <div>
                {
                  state.mediaFiles.find(
                    (i: MediaFile) => i.id === videoTrackItem.mediaFileId
                  ).fileName
                }
              </div>

              <div>{videoTrackItem.duration}</div>
            </div>
          )
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: `${padding + state.currentFrame * 2}px`,
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
