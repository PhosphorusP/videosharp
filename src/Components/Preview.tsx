import { useSelector } from "react-redux";
import {
  composeCurrentFrame,
  exportVideo,
  getTrackStart,
  updateState,
} from "../store/action";
import { cloneDeep } from "lodash-es";
import { Button } from "antd";

const Preview: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <>
      <video
        id="video-host"
        style={{
          display: "none",
          //maxWidth: '256px',
          boxShadow: "0 0 8px red",
          position: "fixed",
          top: "0",
          left: "0",
          pointerEvents: "none",
          zIndex: "-1000",
        }}
      />
      <div>
        <Button type="primary" onClick={() => exportVideo()}>
          导出视频
        </Button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: '8px'
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
