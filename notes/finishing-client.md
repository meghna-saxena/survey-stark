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

- Make cancel and submit btn on surveys/new


## Form validation
- Name the error property name identical to field name, the error will then get automatically rendered because of redux form

```
function validate(values) {
  const errors = {};
  _.each(FIELDS, ({ name }) => {
    if (!values[name]) {
      errors[name] = "This field cannot be empty";
    }
  });

  return errors;
}
```

- Validate emails
  - Use split(), trim(), filter()
  - refer this => http://emailregex.com/




## Toggling visibility
SurveyNew -> ?? -> SurveyForm or SurveyFormReview

How to determine which comp. to show?
- Separate route
- Redux
- Component state - we will use this!


SurveyNew -> state.showReview === true? -> surveyForm or surveyFormReview


## Persisiting form values
Use `destroyOnUnmount: false` property by redux form

```
export default reduxForm({
  validate: validate,
  form: "surveyForm",
  destroyOnUnmount: false
})(SurveyForm);

```

- Created separate file for form fields, and used it in both comp - survey form and survey form review

## Sending survey
- Whenevr state is changed, redux form uses action creator
- 3 tasks
  1. submit the form and post them to the backend server
  2. navigate the user back to dashboard
  3. if user clicks cancel on survey/new, and then enter '+' again, show empty form fields

For 3) step => 

Inside SurveyNew component

```
export default reduxForm({
  form: "surveyForm"
})(SurveyNew);
```

So, when user comes to this component, since its not having destroyOnUnmount:false, it will automatically dump the values.


## POSTing to surveys
- Call action creator with values
- Post form values to API
- Post successful? Redirect users back to `/survey`
- We get the updates user model as response which shows the current credits

action creator =>

```
export const submitSurvey = values => async dispatch => {
  const res = await axios.post("/api/surveys", values);

  dispatch({ type: FETCH_USER, payload: res.data });
};
```


## Redirect on submit
- `Programmatic/automatic navigation`
- submit form review doesnt know about react-router
  - use `withRouter()` helper provided by react-router lib
  - using withRouter to access the object called `history`
  - withRouter works like an hoc
  - wrapped the survey form review comp. with withRouter => passed the history props to action creator => inside action creator call the `history.push('/surveys')`