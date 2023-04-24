import { theme } from "antd";
import { cloneDeep } from "lodash-es";
import { CSSProperties, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { updateState } from "../store/action";

function rotate(cx: number, cy: number, x: number, y: number, angle: number) {
  var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
}

type MapTransformProps = {
  canvasRef: React.MutableRefObject<any>;
};

const MapTransform: React.FC<MapTransformProps> = ({
  canvasRef,
}: MapTransformProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const [, refresh] = useState(0);
  const [anchor, setAnchor] = useState("");
  const [tmpHandlePos, setTmpHandlePos] = useState([0, 0] as [number, number]);
  const [tmpImg, setTmpImg] = useState(null as unknown as MapTrackClip);
  let changeHandler = (e: MouseEvent) => {};
  useEffect(() => {
    let resizeHandler = () => refresh(new Date().getTime());
    window.addEventListener("resize", resizeHandler);
    window.addEventListener("mousemove", changeHandler);
    let changeEndHandler = () => {
      setAnchor("");
    };
    window.addEventListener("mouseup", changeEndHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("mousemove", changeHandler);
      window.removeEventListener("mouseup", changeEndHandler);
    };
  });
  if (!(canvasRef && canvasRef.current)) return <></>;
  let img: MapTrackClip = null as unknown as MapTrackClip;
  const mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
  for (let i of mapTracks as MapTrackItem[]) {
    let clip = i.clips.find((i) => i.id === state.selectedId);
    if (clip) {
      img = clip;
      break;
    }
  }
  if (!img) return <></>;
  if (
    !(
      state.currentFrame >= img.beginOffset &&
      state.currentFrame < img.beginOffset + img.duration
    )
  )
    return <></>;
  const canvas = canvasRef.current as HTMLCanvasElement;
  const canvasRect = canvas.getBoundingClientRect();
  const canvasSize = [canvas.width, canvas.height];
  let offset = [
    (img.composePos[0] * canvasRect.width) / canvasSize[0],
    (img.composePos[1] * canvasRect.height) / canvasSize[1],
  ];
  let size = [
    (img.composeSize[0] * canvasRect.width) / canvasSize[0],
    (img.composeSize[1] * canvasRect.height) / canvasSize[1],
  ];
  let leftTop = [canvasRect.left + offset[0], canvasRect.top + offset[1]];
  const handleStyle: CSSProperties = {
    position: "absolute",
    width: "8px",
    height: "8px",
    outline: `1px solid ${token.colorPrimary}`,
    background: token.colorTextLightSolid,
    transform: "translate(-50%, -50%)",
    boxShadow: `0 0 4px ${token.colorPrimary}`,
  };
  const getHandlePos = (anchor: string) => {
    let handleAnchor = anchor.split(" ").map((i) => parseInt(i)) as [
      number,
      number
    ];
    let cx = leftTop[0] + size[0] / 2;
    let cy = leftTop[1] + size[1] / 2;
    return rotate(
      cx,
      cy,
      leftTop[0] + (handleAnchor[0] / 100) * size[0],
      leftTop[1] + (handleAnchor[1] / 100) * size[1],
      img.composeRotate
    ) as [number, number];
  };
  const changeStartHandler = (anchor: string, e?: any) => {
    setAnchor(anchor);
    if (anchor === "rotate") return;

    setTmpImg(img);
    if (anchor === "move") setTmpHandlePos([e!.clientX, e!.clientY]);
    else
      setTmpHandlePos(
        getHandlePos(
          {
            width: "100 50",
            height: "50 100",
            size: "100 100",
          }[anchor] as string
        )
      );
  };
  changeHandler = (e: MouseEvent) => {
    e.stopPropagation();
    if (!anchor.length) return;
    if (anchor === "move") {
      let ratio = canvasSize[0] / canvasRect.width;
      img.composePos = [
        tmpImg.composePos[0] + (e.clientX - tmpHandlePos[0]) * ratio,
        tmpImg.composePos[1] + (e.clientY - tmpHandlePos[1]) * ratio,
      ];
    } else if (anchor === "rotate") {
      let cx = leftTop[0] + size[0] / 2;
      let cy = leftTop[1] + size[1] / 2;
      img.composeRotate =
        Math.floor(
          (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90
        ) % 360;
    } else {
      let tmpDis = leftTop[0] - tmpHandlePos[0];
      let dis = leftTop[0] - e.clientX;
      let ratio = dis / tmpDis;
      switch (anchor) {
        case "size":
          img.composeSize = [
            tmpImg.composeSize[0] * ratio,
            tmpImg.composeSize[1] * ratio,
          ];
          break;
        case "width":
          img.composeSize = [
            tmpImg.composeSize[0] * ratio,
            tmpImg.composeSize[1],
          ];
          break;
        case "height":
          tmpDis = leftTop[1] - tmpHandlePos[1];
          dis = leftTop[1] - e.clientY;
          ratio = dis / tmpDis;
          img.composeSize = [
            tmpImg.composeSize[0],
            tmpImg.composeSize[1] * ratio,
          ];
          break;
      }
    }
    updateState({ mapTracks });
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: `${leftTop[0]}px`,
          top: `${leftTop[1]}px`,
          boxSizing: "border-box",
          width: `${size[0]}px`,
          height: `${size[1]}px`,
          border: `1px solid ${token.colorPrimary}`,
          transform: `rotate(${img.composeRotate}deg)`,
        }}
      >
        <div
          style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
          onMouseDown={(e) => changeStartHandler("move", e)}
        />
        <div
          style={{
            position: "absolute",
            width: "1px",
            height: "24px",
            background: token.colorPrimary,
            transform: "translate(-50%, -100%)",
            left: "50%",
            top: "0",
          }}
        />
        <div
          style={{
            ...handleStyle,
            borderRadius: "16px",
            left: "50%",
            top: "-24px",
          }}
          onMouseDown={() => changeStartHandler("rotate")}
        />
        <div
          style={{
            ...handleStyle,
            left: "100%",
            top: "50%",
          }}
          onMouseDown={() => changeStartHandler("width")}
        />
        <div
          style={{
            ...handleStyle,
            left: "50%",
            top: "100%",
          }}
          onMouseDown={() => changeStartHandler("height")}
        />
        <div
          style={{
            ...handleStyle,
            left: "100%",
            top: "100%",
          }}
          onMouseDown={() => changeStartHandler("size")}
        />
      </div>
    </>
  );
};
export default MapTransform;
