import { useDroppable } from "@dnd-kit/core";
import { theme } from "antd";
import { CSSProperties } from "react";
import { Item, Menu } from "react-contexify";
import { useSelector } from "react-redux";
import { deleteClip } from "../../store/action";
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
          outline: isOver ? `2px solid ${token.colorPrimary}` : undefined,
          background: isOver ? token.colorPrimaryBgHover : undefined,
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
      <Menu
        id={mapTrack.id}
        theme={state.darkMode ? "dark" : "light"}
        style={
          {
            "--contexify-activeItem-bgColor": token.colorPrimary,
            "--contexify-activeItem-color": token.colorTextLightSolid,
            "--contexify-menu-shadow": "0 0 8px rgba(0,0,0,0.2)",
          } as CSSProperties
        }
      >
        <Item onClick={(e) => deleteClip(e.props.id)}>删除此片段</Item>
      </Menu>
    </div>
  );
};
export default MapTrack;
