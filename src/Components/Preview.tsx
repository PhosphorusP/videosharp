import { useSelector } from "react-redux";
import { composeCurrentFrame, exportVideo, updateState } from "../store/action";
import { cloneDeep } from "lodash-es";

const Preview: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <>
      Preview current:{state.currentFrame}
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
        <button onClick={() => composeCurrentFrame()}>compose</button>
        <button onClick={() => exportVideo()}>export</button>
        <button
          onClick={() => {
            let videoTrack = cloneDeep(state.videoTrack) as VideoTrackItem[];
            videoTrack[1].beginOffset += 30;
            videoTrack[1].duration -= 30;
            videoTrack[1].mediaOffset += 30;
            updateState({
              videoTrack: videoTrack,
            });
          }}
        >
          Cut Clip 2
        </button>
      </div>
      <div>
        <canvas
          id="canvas"
          width={state.projectSize[0]}
          height={state.projectSize[1]}
        />
      </div>
    </>
  );
};
export default Preview;
