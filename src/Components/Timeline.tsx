import { useRef, useState } from "react";
import { useSelector } from "react-redux";

const Timeline: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const [currentFrame, setCurrentFrame] = useState(0);
  const rulerRef = useRef(null);
  const trackDuration = state.videoTrack.length
    ? state.videoTrack.reduce(
        (prev: number, cur: VideoTrackItem) => prev + cur.duration,
        0
      )
    : 0;
  return (
    <div
      style={{
        flex: 1,
        overflowX: "scroll",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        ref={rulerRef}
        style={{
          height: "16px",
          width: `${trackDuration * 2}px`,
          backgroundColor: "red",
          borderRadius: '4px'
        }}
        onMouseDown={function (e) {
          let offsetX =
            Math.round(e.clientX - (rulerRef.current as any).clientLeft) / 2;
          if (offsetX <= trackDuration) setCurrentFrame(Math.round(offsetX));
        }}
        onMouseMove={function (e) {
          let offsetX =
            Math.round(e.clientX - (rulerRef.current as any).clientLeft) / 2;
          if (e.buttons && offsetX <= trackDuration)
            setCurrentFrame(Math.round(offsetX));
        }}
      />
      <div style={{ whiteSpace: "nowrap" }}>
        {state.videoTrack.map((videoTrackItem: VideoTrackItem) => (
          <div
            key={videoTrackItem.id}
            style={{
              display: "inline-block",
              height: "56px",
              width: `${videoTrackItem.duration * 2}px`,
              backgroundImage: `url(${
                state.mediaFiles.find(
                  (i: MediaFile) => i.id === videoTrackItem.mediaFileId
                ).thumbnailDataUrl
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              color: "#FFF",
              textShadow: "0 2px 4px #000",
              borderRadius: "8px",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {state.mediaFiles.find(
                  (i: MediaFile) => i.id === videoTrackItem.mediaFileId
                ).fileName}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: `${currentFrame * 2}px`,
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
