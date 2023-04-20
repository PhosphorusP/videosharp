import { nanoid } from "nanoid";
import { combineReducers } from "redux";
const initialState = {
  projectSize: [512, 512],
  projectFPS: 30,
  importing: false,
  mediaFiles: [],
  videoTrack: [],
  subtitleTracks: [],
  mapTracks: [],
  currentFrame: 0,
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
