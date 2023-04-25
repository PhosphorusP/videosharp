import { useSelector } from "react-redux";
import { getTrackDuration } from "../../store/action";
import SubtitleTrackClip from "./SubtitleTrackClip";

type SubtitleTrackProps = {
  subtitleTrack: SubtitleTrackItem;
};

const SubtitleTrack: React.FC<SubtitleTrackProps> = ({
  subtitleTrack,
}: SubtitleTrackProps) => {
  const state: any = useSelector((state: any) => state.reducer);
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
            } as SubtitleTrackClip
          }
        />
      </div>
    </div>
  );
};
export default SubtitleTrack;
