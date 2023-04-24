import { useSelector } from "react-redux";
import MediaFileItem from "./MediaFileItem";

const MediaFiles: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <div>
      {state.mediaFiles.map((mediaFile: MediaFile) => (
        <MediaFileItem
          key={mediaFile.id}
          id={mediaFile.id}
          type={mediaFile.type}
          fileName={mediaFile.fileName}
          thumbnailDataUrl={mediaFile.thumbnailDataUrl}
          dragOverlay={false}
        />
      ))}
    </div>
  );
};
export default MediaFiles;
