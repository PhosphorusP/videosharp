import { combineReducers } from "redux";
const initialState = {
  ffmpegLoading: false,
  ffmpegLogs: [] as string[],
  projectSize: [640, 360],
  projectFPS: 30,
  importing: false,
  importProgress: [] as ImportProgress,
  mediaFiles: [] as MediaFile[],
  videoTrack: [] as VideoTrackClip[],
  mapTracks: [] as MapTrackItem[],
  subtitleTracks: [],
  currentFrame: 0,
  timelineRatio: 2,
  timelineCollapsed: false,
  selectedId: "",
  clipOrigin: "",
  darkMode: false,
  undoStack: [],
  redoStack: [],
  tracksSort: ["track_video"],
  draggingType: "",
  exporting: false,
  exportProgress: {
    framesTotal: 0,
    framesCurrent: 0,
    audioGenerated: false,
  } as ExportProgress,
};
const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "updateState":
      return {
        ...state,
        ...action.assignments,
      };
    default:
      return state;
  }
};
export default combineReducers({ reducer });
