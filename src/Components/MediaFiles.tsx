import { useSelector } from "react-redux";

const MediaFiles: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <>
      <div>MediaFiles</div>
      {state.mediaFiles.map((mediaFile: MediaFile) => (
        <div
          key={mediaFile.id}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <img
            src={mediaFile.thumbnailDataUrl}
            style={{ maxWidth: "72px", maxHeight: "72px" }}
          />
          <span>{mediaFile.fileName}</span>
        </div>
      ))}
    </>
  );
};
export default MediaFiles;
