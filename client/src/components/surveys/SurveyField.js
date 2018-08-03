import React from "react";

const SurveyField = ({ input, label }) => {
  //accessing props.input, props are given by field helper from redux form
  return (
    <div>
      <label>{label}</label>
      <input {...input} />
    </div>
  );
};

export default SurveyField;
