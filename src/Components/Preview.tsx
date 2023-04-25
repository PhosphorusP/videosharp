import { useRef } from "react";
import { useSelector } from "react-redux";
import MapTransform from "./MapTransform";

const Preview: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const canvasRef = useRef(null);
  return (
    <>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: "8px",
          position: "relative",
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
