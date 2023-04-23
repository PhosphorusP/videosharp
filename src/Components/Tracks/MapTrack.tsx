import { useDroppable } from "@dnd-kit/core";
import { theme } from "antd";
import { CSSProperties } from "react";
import { Item, Menu } from "react-contexify";
import { useSelector } from "react-redux";
import { deleteClip } from "../../store/action";
import MapTrackClip from "./MapTrackClip";
import { EllipsisOutlined, PictureOutlined } from "@ant-design/icons";

type MapTrackProps = {
  mapTrack: MapTrackItem;
};

const MapTrack: React.FC<MapTrackProps> = ({ mapTrack }: MapTrackProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const { isOver, setNodeRef } = useDroppable({
    id: `track_map_${mapTrack.id}`,
    data: {
      accepts: ["map"],
    },
  });
  const trackHeight = state.timelineCollapsed ? 28 : 56 + 16;
  return (
    <>
      <div
        ref={setNodeRef}
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
          marginTop: state.timelineCollapsed ? 0 : "16px",
          marginBottom: `-${trackHeight}px`,
          boxSizing: "border-box",
          height: state.timelineCollapsed ? "28px" : "56px",
          width: `${state.timelineCollapsed ? 28 : 56}px`,
          zIndex: "20",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PictureOutlined
          style={{
            fontSize: state.timelineCollapsed ? "12px" : "16px",
            color: token.colorTextSecondary,
          }}
        />
      </div>
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
          } as CSSProperties
        }
      >
        <Item onClick={(e) => deleteClip(e.props.id)}>删除此素材</Item>
      </Menu>
    </>
  );
};
export default MapTrack;
