import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import App from "./components/App";

//create new instance of redux store
// 1st arg is dummy reducer
//2nd arg is initial state of app, imp in serverside rendering, but right now just put empty obj {}
//3rd arg is middleware
const store = createStore(() => [], {}, applyMiddleware());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root")
);
