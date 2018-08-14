import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import * as actions from "../actions";
import Header from "./Header";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import SurveyNew from "./surveys/SurveyNew";

class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
  }
  render() {
    return (
      <BrowserRouter>
        <div>
          <div className="container-fluid">
            <Header />
            <Route path="/" exact component={Landing} />
          </div>
          <div className="container">
            <Route path="/surveys" exact component={Dashboard} />
            <Route path="/surveys/new" component={SurveyNew} />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default connect(
  null,
  actions
)(App);
