import { FETCH_SURVEYS, DELETE_SURVEY } from "../actions/types";

export default (state = [], action) => {
  switch (action.type) {
    case FETCH_SURVEYS:
      // console.log("action", action.payload);
      
    case DELETE_SURVEY:
      console.log("deleteSurveyReducer", action.payload);
      return action.payload;
      break;
    default:
      return state;
  }
};
