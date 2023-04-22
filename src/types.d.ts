type MediaFile = {
  id: string;
  type: "video" | "map";
  objectURL: string;
  file: File;
  thumbnailDataUrl: string;
  fileName: string;
  duration: number;
};
type VideoTrackItem = {
  id: string;
  mediaFileId: string;
  mediaOffset: number;
  beginOffset: number;
  duration: number;
};
type AudioTrackItem = { fileName: string };
