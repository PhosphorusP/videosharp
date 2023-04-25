import { useDraggable } from "@dnd-kit/core";
import { theme } from "antd";
import { useContextMenu } from "react-contexify";
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
  const { show: showContextMenu } = useContextMenu({
    id: "contextmenu_mediafiles",
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        marginTop: "8px",
        width: "50%",
        display: "inline-block",
        cursor: "default",
      }}
      onContextMenu={(e) => showContextMenu({ event: e, props: { id } })}
    >
      <div
        style={{
          width: dragOverlay ? "128px" : "100%",
          paddingBottom: dragOverlay
            ? state.timelineCollapsed
              ? "28px"
              : "56px"
            : "56.25%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url(${thumbnailDataUrl})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          transform: "scale(0.8)",
        }}
      />
      {dragOverlay ? undefined : (
        <div
          style={{
            flex: 1,
            color: token.colorText,
            overflowX: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "12px",
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          {fileName}
        </div>
      )}
    </div>
  );
};

export default MediaFileItem;
