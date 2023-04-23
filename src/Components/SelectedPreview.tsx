import { theme } from "antd";

type SelectedPreviewProps = {
  title: string;
  subtitle: string;
  thumbUrl: string;
};

const SelectedPreview: React.FC<SelectedPreviewProps> = ({
  title,
  subtitle,
  thumbUrl,
}: SelectedPreviewProps) => {
  const { token } = theme.useToken();
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: '16px' }}>
      <div
        style={{
          width: "80px",
          height: "45px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: "8px",
        }}
      >
        <img
          alt="视频预览图"
          src={thumbUrl}
          draggable={false}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: "4px",
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ color: token.colorText }}>{title}</div>
        <div
          style={{
            color: token.colorTextSecondary,
            fontSize: "12px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default SelectedPreview;
