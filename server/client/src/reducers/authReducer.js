import { FETCH_USER } from "../actions/types";

export default (state = null, action) => {
  switch (action.type) {
    case FETCH_USER:
      return action.payload || false; //if user is not auth'd return false
    default:
      return state;
  }
};
