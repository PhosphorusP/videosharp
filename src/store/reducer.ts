import { combineReducers } from "redux";
const initialState = {
  appLoading: false,
  projectSize: [640, 360],
  projectFPS: 30,
  importing: false,
  mediaFiles: [],
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
