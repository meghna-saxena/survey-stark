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


## Model deficiencies
- Deficiencies present in the way we have created schema


Where do we store feedback?
- Add additional property inside survey schema to store feedback response
- Prevent user from clicking the yes/no btn multiple times


> How to prevent duplicates?
`Subdocument collection`, term used by mongo and mongoose

Survey - title/body/sub/recipients/yes/no

recipients: [String] //array of string, and every str is individual email address

- Recipients property will have subdocument collection, submodel recipient, there would be single recipient for every str of array
Recipients -> recipient -> email/clicked


## Limitations of Subdocument Collections
- When we create a surveys model, we get a new collection inside mongodb that stores a list of surveys. So inside `surveys collection`, bunch of `instances of survey`.

- Can store variety of records inside survey, that is referred as subdocument collection. So each survey can have multiple recipient.

- We make subdocument collection when we need clear association b/w 2 given records. So recipient is useful as a child of survey.

- Now since our user collection can have many surveys, why we dont create surveys as a subdocument inside user collection, why we create 2 diff models.
    - In mongodb, we refer records inside of a collection as document.


> Mongo Size limit for a single record = 4mb!
_________________________________________________
- Only stuff 4mb data into a single document/record


> Check on byte counter
xyz@gmail.com -> 20bytes
xyz@gmail.com x 200,000 -> ~4mb

So, a single survey can only store about 200,000 email addresses

- So if we make survey a subdoucment inside user model, we'll run out of size limit!    


> Note:
The actual maximum size of the documents on the current releases of mongo db is 16mb. It was increased from 4 to 16 around 2010.
https://docs.mongodb.com/manual/reference/limits/

BSON Document Size
The maximum BSON document size is 16 megabytes.

The maximum document size helps ensure that a single document cannot use excessive amount of RAM or, during transmission, excessive amount of bandwidth. To store documents larger than the maximum size, MongoDB provides the GridFS API. See mongofiles and the documentation for your driver for more information about GridFS.



## Setting up Subdocs
- Setup recipient subcollection and nest it within single survey
- Create a new recipient file and make a new schema with its properties - email, clicked(which s a boolean)

- At the bottom of the file, rather than registring the schema with the mongoose, export the schema
- Require the recipientSchema inside survey model, to setup subdoc collect. inside survey model

Rather than arr of str, its arr of record that confirms to the recipientSchema

```
//create schema for new collection
const surveySchema = new Schema({
  title: String,
  body: String,
  subject: String,
  recipients: [RecipientSchema], 
  //instead of [String] array of string, and every str is individual email address, we use arr of subdoc
  
  yes: { type: Number, default: 0 }, //when 2 properties have to be passed, make an obj
  no: { type: Number, default: 0 }
});

//create mongoose model class
mongoose.model("surveys", surveySchema);
```

- When mongoose first loads up the surveys model, whenever it saves a record to the surveys collection, it will store an arr of recipientSchema records