import { nanoid } from "nanoid";
import { combineReducers } from "redux";
const initialState = {
    mediaFiles: [],
    videoTrack: [],
    subtitleTracks: [],
    mapTracks: []
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
