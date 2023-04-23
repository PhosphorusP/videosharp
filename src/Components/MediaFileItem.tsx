import { useDraggable } from "@dnd-kit/core";
import { theme } from "antd";
import { useSelector } from "react-redux";

type MediaFileItemProps = {
  id: string;
  type: string;
  fileName: string;
  thumbnailDataUrl: string;
  dragOverlay: boolean;
};

const MediaFileItem: React.FC<MediaFileItemProps> = ({
  id,
  type,
  fileName,
  thumbnailDataUrl,
  dragOverlay,
}: MediaFileItemProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `${id}`,
    data: {
      type: `${type}`,
    },
  });
  const { token } = theme.useToken();
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        margin: "8px",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: "48px",
          height: dragOverlay
            ? state.timelineCollapsed
              ? "28px"
              : "56px"
            : "27px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: "8px",
        }}
      >
        <img
          alt="视频预览图"
          src={thumbnailDataUrl}
          draggable={false}
          style={{
            maxWidth: dragOverlay ? undefined : "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: dragOverlay ? "8px" : "4px",
          }}
        />
      </div>
      {dragOverlay ? undefined : (
        <div
          style={{
            flex: 1,
            color: token.colorText,
            overflowX: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "12px",
          }}
        >
          {fileName}
        </div>
      )}
    </div>
  );
};

export default MediaFileItem;
