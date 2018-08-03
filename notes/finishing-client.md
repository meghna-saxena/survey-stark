## Client side survey creation

- Now we can either go back to backend, to create some endpoints for sendgrid webhook, to make sure whenever user clicks on a btn, it gives some feedback to our server. Or we can work on frontend component to create new survey!

> Workflow

- Create survey is 2 stage process =>

`surveystark.com/surveys/new`

    - Header will have logo/brandname, add credits, credits, logout
    - Survey title, subject line, email body, recipient list, cancel & next btn
    - On clicking next btn, user can review the filled form, there are back & submit btn

- For the user to navigate to this form, put a + btn on dashboard
- This dashboard will show list of surveys and a + btn



## Material Icons
Refer => https://materializecss.com/

- Add the link to client/index.html for accessing icons


## Navigation with the Link tag
- Link tag by react-router-dom
- Give to property, redirecting it to "/surveys/new"



## SurveyNew form
- SurveyNew - overall component
    - SurveyForm
    - SurveyField

- SurveyFormReview - another component


## Purpose of redux form

Component structure =>

    - App
        - SurveyNew
            - SurveyForm -> SurveyField/SurveyField/SurveyField
            - SurveyFormReview

        Both components need data/value from the SurveyField

We use redux form because =>
When user enters some surveyfield, that calls an action creator and updates the state in redux store, so structure becomes => 

- Redux
    - App
        - SurveyNew
            - SurveyForm -> SurveyField/SurveyField/SurveyField
            - SurveyFormReview


- Now we can connect SurveyFormReview to redux store


Redux -> Store -> authReducer, formReducer (formReducer is managed entirely by redux form, it records all the values from the form automatically.)



## Redux form setup

- We're creating wizard form, which is multi-pages and has next btn
- import {reduxForm} from 'redux-form' inside surveyForm.js
- think of reduxForm as connect helper which allows to connect the comp with the redux store    
- Field is a helper provided by redux-form for rendering any type of html form element.

```
<form onSubmit={this.props.handleSubmit(values => console.log(values))}>
    <Field type="text" name="surveyTitle" component="input" />
    <button type="submit">Submit</button>
</form>
```

- name property tells that we have one piece of data produced by redux form called surveyTitle, so the value we type in the filed will be stored under the key of surveyTitle

- component="input" means we want a html input tag. We can also replace component={} some custom react comp.

-  <form onSubmit={this.props.handleSubmit}> 
this func. is provided automatically by redux form helper that we wired at the bottom




## Custom field components
- Create surveyField.js and render it inside surveyForm

```
import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import SurveyField from "./SurveyField";

class SurveyForm extends Component {
  renderFields() {
    return (
      <div>
        <Field type="text" name="title" component={SurveyField} />
      </div>
    );
  }
  render() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmit(values => console.log(values))}>
          {/* <Field type="text" name="surveyTitle" component="input" /> */}
          {this.renderFields()}
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default reduxForm({
  form: "surveyForm"
})(SurveyForm);
```


## Wiring up custom fields
- Since survey field comp is wired up with field helper method by redux form, it has access to many props, eg: event handlers. So if any change is made on input, event handler notice it automatically. We dont need to define an event handler.

```
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
```

Inside survey form pass the label this way =>

```
class SurveyForm extends Component {
  renderFields() {
    return (
      <div>
        <Field
          label="Survey Title"
          type="text"
          name="title"
          component={SurveyField}
        />
        ...
```


## Fields from config

```
const FIELDS = [
  { label: "Survey Title", name: "title" },
  { label: "Subject Line", name: "subject" },
  { label: "Email Body", name: "body" },
  { label: "Recipient List", name: "emails" }
];

class SurveyForm extends Component {
  renderFields() {
    return _.map(FIELDS, field => {
      return (
        <Field
          key={field.name}
          component={SurveyField}
          type="text"
          label={field.label}
          name={field.name}
        />
      );
    });
  }
```