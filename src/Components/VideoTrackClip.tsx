import { useSelector } from "react-redux";
import { getTrackDuration } from "../store/action";

type VideoTrackClipProps = {
  videoTrackItem: VideoTrackItem;
};
const VideoTrackClip: React.FC<VideoTrackClipProps> = ({
  videoTrackItem,
}: VideoTrackClipProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <div
      key={videoTrackItem.id}
      style={{
        position: "absolute",
        top: 0,
        left: `${videoTrackItem.beginOffset * state.timelineRatio}px`,

        display: "inline-block",
        height: "56px",
        width: `${
          (videoTrackItem.duration -
            (videoTrackItem.beginOffset +
              (videoTrackItem.duration as number) ===
            getTrackDuration(state.videoTrack)
              ? 1
              : 0)) *
          state.timelineRatio
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

        fontSize: "12px",
      }}
    >
      <div>
        {
          state.mediaFiles.find(
            (i: MediaFile) => i.id === videoTrackItem.mediaFileId
          ).fileName
        }
      </div>
      <div>
        {videoTrackItem.beginOffset} - {videoTrackItem.duration} (
        {videoTrackItem.beginOffset + videoTrackItem.duration - 1})
      </div>
    </div>
  );
};
export default VideoTrackClip;
