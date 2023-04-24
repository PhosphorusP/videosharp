type MediaFile = {
  id: string;
  type: "video" | "map";
  objectURL: string;
  file: File;
  thumbnailDataUrl: string;
  fileName: string;
  duration: number;
  data: any;
};
type TrackClip = {
  id: string;
  mediaFileId: string;
  beginOffset: number;
  duration: number;
};
type VideoTrackClip = TrackClip & {
  mediaOffset: number;
};
type MapTrackItem = {
  id: string;
  clips: MapTrackClip[];
};
type MapTrackClip = TrackClip & {
  mediaSize: [number, number];
  composePos: [number, number];
  composeSize: [number, number];
};
type AudioTrackItem = { fileName: string };
