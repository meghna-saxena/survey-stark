## Survey Overview
- Building survey endpoint on our API
- Ability for users to create surveys, send them and record feedback

> Workflow

- User creates survey with simple yes/no ques
- Express server creates an email template
- Use 3rd party email provider to send email
- End user clicks 'yes' or 'no' response
- Email provider notes response
- Email provider sends note to express server
- Express server records feedback in Mongo


What would the email to the end user look like?

```
Subject: Do you like our product?
From: feedback@startup.com

We were hoping you could tell us if you like our service. Do you?

Yes  No

```


## Server routes

Survey routes
_______________

GET /api/surveys => returns a list of surveys created by the current_user

POST /api/surveys/webhooks => records feedback from a user

POST /api/surveys => creates a new survey  
title - title of the survey the user will see in our app 
subject - subject line
body - text to show in the survey
recipients - comma separated list of email addresses to send survey to


## Survey model
User -> Survey (a new model class) -> title/body/subj/recipients

- Inorder to know which user created which survey there's link b/w user model class and survey model class  
- Create new model class -> Survey.js

- require mongoose
- Get {schema} obj out of mongoose
- create new schema containing all diff properties, model class will have
- load the schema into mongoose lib by calling mongoose.model('name of model class', name of schema)
- require the file inside index.js