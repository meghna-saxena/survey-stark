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