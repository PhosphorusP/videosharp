import { Button, Space } from "antd";
import { useSelector } from "react-redux";
import { exportVideo } from "../store/action";
import { useRef } from "react";
import MapTransform from "./MapTransform";

const Preview: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const canvasRef = useRef(null);
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
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: "8px",
          position: 'relative'
        }}
      >
        <canvas
          id="canvas"
          ref={canvasRef}
          width={state.projectSize[0]}
          height={state.projectSize[1]}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
        <MapTransform canvasRef={canvasRef} />
      </div>
    </>
  );
};
export default Preview;
