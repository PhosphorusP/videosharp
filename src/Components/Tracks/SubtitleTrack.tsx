import { theme } from "antd";
import { CSSProperties } from "react";
import { Item, Menu } from "react-contexify";
import { useSelector } from "react-redux";
import { deleteClip, getTrackDuration } from "../../store/action";
import SubtitleTrackClip from "./SubtitleTrackClip";

type SubtitleTrackProps = {
  subtitleTrack: SubtitleTrackItem;
};

const SubtitleTrack: React.FC<SubtitleTrackProps> = ({
  subtitleTrack,
}: SubtitleTrackProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const trackHeight = state.timelineCollapsed ? 28 : 56 + 16;
  return (
    <div>
      <div
        style={{
          whiteSpace: "nowrap",
          position: "relative",
          height: `${trackHeight}px`,
        }}
      >
        {subtitleTrack.clips.map((subtitleTrackClip: SubtitleTrackClip) => (
          <SubtitleTrackClip
            key={subtitleTrackClip.id}
            subtitleTrack={subtitleTrack}
            subtitleTrackClip={subtitleTrackClip}
          />
        ))}
        <SubtitleTrackClip
          key="new"
          subtitleTrack={subtitleTrack}
          subtitleTrackClip={
            {
              id: "new",
              mediaFileId: "",
              beginOffset: getTrackDuration(subtitleTrack.clips) - 1,
              duration: state.projectFPS,
              content: "",
              fontSize: 0,
              color: "",
              backgroundColor: "",
            } as SubtitleTrackClip
          }
        />
      </div>
      <Menu
        id={subtitleTrack.id}
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
export default SubtitleTrack;
