import { combineReducers } from "redux";
const initialState = {
  appLoading: false,
  projectSize: [512, 512],
  projectFPS: 30,
  importing: false,
  mediaFiles: [],
  videoTrack: [],
  subtitleTracks: [],
  mapTracks: [],
  currentFrame: 0,
  timelineRatio: 2,
  selectedId: "",
  dragOrigin: "",
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
