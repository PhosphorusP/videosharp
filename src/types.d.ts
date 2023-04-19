type MediaFile = {
  id: string;
  type: "video" | "map";
  objectURL: string;
  thumbnailDataUrl: string;
  fileName: string;
  duration: number;
};
type VideoTrackItem = {
  id: string;
  mediaFileId: string;
  beginOffset: number;
  duration: number;
};
