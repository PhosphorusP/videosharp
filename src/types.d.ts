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
type MultiTrackItem = { id: string };
type MapTrackItem = MultiTrackItem & { clips: MapTrackClip[] };
type MapTrackClip = TrackClip & {
  composePos: [number, number];
  composeSize: [number, number];
  composeRotate: number;
};
type SubtitleTrackItem = MultiTrackItem & { clips: SubtitleTrackClip[] };
type SubtitleTrackClip = TrackClip & {
  content: string;
  composePos: [number, number];
  fontSize: number;
  color: string;
};
type AudioTrackItem = { fileName: string };
type ImportProgress = {
  fileName: string;
  progress: "waiting" | "converting" | "done";
}[];
type ExportProgress = {
  framesTotal: number;
  framesCurrent: number;
  audioGenerated: boolean;
};
