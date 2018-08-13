import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchSurveys, deleteSurvey } from "../../actions";

class SurveyList extends Component {
  componentDidMount() {
    this.props.fetchSurveys();
  }

  deleteSurvey = id => {
    console.log("survey id", id);
    this.props.deleteSurvey(id);
  };

  renderSurveys() {
    return this.props.surveys.reverse().map(survey => {
      return (
        <div className="card grey lighten-5" key={survey._id}>
          <div className="card-content">
            <span onClick={() => this.deleteSurvey(survey._id)}>
              <i className="material-icons right">clear</i>
            </span>
            <span className="card-title">{survey.title}</span>
            <p>{survey.body}</p>
            <p className="right">
              Sent on: {new Date(survey.dateSent).toLocaleDateString()}
            </p>
          </div>
          <div className="card-action">
            <a>Yes: {survey.yes}</a>
            <a>No: {survey.no}</a>
          </div>
        </div>
      );
    });
  }

  render() {
    return <div>{this.renderSurveys()}</div>;
  }
}

function mapStateToProps(state) {
  return { surveys: state.surveys };
}

export default connect(
  mapStateToProps,
  { fetchSurveys, deleteSurvey }
)(SurveyList);
