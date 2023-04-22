import { useSelector } from "react-redux";
import {
  composeCurrentFrame,
  exportVideo,
  getTrackStart,
  updateState,
} from "../store/action";
import { cloneDeep } from "lodash-es";

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
      {undefined && (
        <div>
          <button onClick={() => exportVideo()}>export</button>
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
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
