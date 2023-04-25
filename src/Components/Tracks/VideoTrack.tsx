import { useDroppable } from "@dnd-kit/core";
import { theme } from "antd";
import { nanoid } from "nanoid";
import { useSelector } from "react-redux";
import VideoTrackClip from "./VideoTrackClip";

const VideoTrack: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: "track_video",
    data: {
      accepts: ["video"],
    },
  });
  const trackId = nanoid();
  const trackHeight = state.timelineCollapsed ? 28 : 56 + 16;
  let onDrop = isOver && ["video"].indexOf(state.draggingType) >= 0;
  return (
    <div>
      <div
        ref={setDroppableNodeRef}
        style={{
          position: "sticky",
          left: 0,
          width: "100%",
          height: `${trackHeight}px`,
          marginTop: state.timelineCollapsed ? undefined : "4px",
          marginBottom: `-${trackHeight}px`,
          borderRadius: "8px",
          outline: onDrop ? `2px solid ${token.colorPrimary}` : undefined,
          background: onDrop ? token.colorPrimaryBgHover : undefined,
        }}
      />
      <div
        style={{
          whiteSpace: "nowrap",
          position: "relative",
          height: `${trackHeight}px`,
        }}
      >
        {state.videoTrack.map((videoTrackItem: VideoTrackClip) => (
          <VideoTrackClip
            key={videoTrackItem.id}
            videoTrackClip={videoTrackItem}
            trackId={trackId}
          />
        ))}
      </div>
    </div>
  );
};
export default VideoTrack;
