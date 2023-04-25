let photon: any;
(async () => {
  photon = await import("@silvia-odwyer/photon");
})();

export const MapArtRender = ({
  ctx,
  img,
  imgObj,
}: {
  ctx: CanvasRenderingContext2D;
  img: MapTrackClip;
  imgObj: HTMLImageElement;
}) => {
  if (img.artEffect === "none") return false;
  let dataCanvas = document.createElement("canvas");
  let dataCtx = dataCanvas.getContext("2d")!;
  dataCanvas.width = img.composeSize[0];
  dataCanvas.height = img.composeSize[1];
  dataCtx.drawImage(imgObj, 0, 0, dataCanvas.width, dataCanvas.height);
  let image = photon.open_image(dataCanvas, dataCtx);
  switch (img.artEffect) {
    case "emboss":
      photon.emboss(image);
      break;
    case "solarize":
      photon.solarize(image);
      break;
    case "offset_red":
      photon.offset(
        image,
        0,
        Math.sqrt(
          Math.pow(img.composeSize[0], 2) + Math.pow(img.composeSize[1], 2)
        ) / 50
      );
      break;
    case "apply_gradient":
      photon.apply_gradient(image);
      break;
  }
  photon.putImageData(dataCanvas, dataCtx, image);
  ctx.translate(
    img.composePos[0] + img.composeSize[0] / 2,
    img.composePos[1] + img.composeSize[1] / 2
  );
  ctx.rotate((img.composeRotate * Math.PI) / 180);
  ctx.drawImage(
    dataCanvas,
    -img.composeSize[0] / 2,
    -img.composeSize[1] / 2,
    img.composeSize[0],
    img.composeSize[1]
  );
  return true;
};

export const SubtitleArtRender = ({
  ctx,
  subtitle,
  frameNum,
  projectFPS,
}: {
  ctx: CanvasRenderingContext2D;
  subtitle: SubtitleTrackClip;
  frameNum: number;
  projectFPS: number;
}) => {
  if (subtitle.artEffect === "none") return false;
  switch (subtitle.artEffect) {
    case "disco":
      ctx.font = `${subtitle.fontSize}px  sans-serif`;
      ctx.textBaseline = "top";
      let offset = subtitle.fontSize * 0.95;
      ctx.fillStyle =
        frameNum % projectFPS < projectFPS / 2
          ? "rgba(255,119,255, 0.5)"
          : "rgba(0,255,255, 0.5)";
      ctx.fillText(
        subtitle.content,
        subtitle.composePos[0] +
          (frameNum % projectFPS < projectFPS / 2 ? -1 : 1) *
            ((frameNum % (projectFPS / 2)) / projectFPS) *
            offset,
        subtitle.composePos[1]
      );
      ctx.fillStyle = subtitle.color;
      ctx.fillText(
        subtitle.content,
        subtitle.composePos[0],
        subtitle.composePos[1]
      );
      break;
  }
  return true;
};
