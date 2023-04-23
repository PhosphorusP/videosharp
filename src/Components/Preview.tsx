import { Button, Space } from "antd";
import { useSelector } from "react-redux";
import { exportVideo } from "../store/action";

const Preview: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <>
      <video
        id="video-host"
        style={{
          display: "none",
          boxShadow: "0 0 8px red",
          position: "fixed",
          top: "0",
          left: "0",
          pointerEvents: "none",
          zIndex: "-1000",
        }}
      />
      <div style={{ padding: "8px" }}>
        <Space direction="horizontal">
          <Button type="primary" onClick={() => exportVideo()}>
            测试导出视频
          </Button>
        </Space>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: "8px",
        }}
      >
        <canvas
          id="canvas"
          width={state.projectSize[0]}
          height={state.projectSize[1]}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </>
  );
};
export default Preview;
