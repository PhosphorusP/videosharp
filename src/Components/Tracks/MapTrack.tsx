import { useDroppable } from "@dnd-kit/core";
import { theme } from "antd";
import { useSelector } from "react-redux";
import MapTrackClip from "./MapTrackClip";

type MapTrackProps = {
  mapTrack: MapTrackItem;
};

const MapTrack: React.FC<MapTrackProps> = ({ mapTrack }: MapTrackProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `track_map_${mapTrack.id}`,
    data: {
      accepts: ["map"],
    },
  });
  const trackHeight = state.timelineCollapsed ? 28 : 56 + 16;
  let onDrop = isOver && ["map"].indexOf(state.draggingType) >= 0;
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
        {mapTrack.clips.map((mapTrackClip: MapTrackClip) => (
          <MapTrackClip
            key={mapTrackClip.id}
            mapTrack={mapTrack}
            mapTrackClip={mapTrackClip}
          />
        ))}
      </div>
    </div>
  );
};
export default MapTrack;
