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



## Relationship fields
- A user will have many surveys, so how to identify which survey belongs to which user?

- To set a relationship b/w survey and user, add another property to survey schema object

_user to make mognoose understand that this is reference to a particular user or another instance of a user

_user means every surveySchema belong to a particular user. 
- type: Schema.Types.ObjectId, (id of the user on this record)
- ref: "User" (reference we are making belong to User colletion)

by convention we write like _user to tell it has relationship/ref field b/w this model and other model

dateSent: Date,
lastResponded: Date

- These properties gives an idea to user, that whether this survey is active or not
Eg: You got 500 responses, and the last time someone responsed was like week ago


> Note:

Why are we using User rather than users as the ref?
Shouldn't the reference be users?  When we created the user schema we named the collection users.  The file name was User but the actual schema was users.  


From reading the mongoose docs, it seems the ref should actually be 'User' and the models should also be 'User', 'Survey', etc....(I changed all mine in the models, and the imports) He might actually fix it later in the course. I'm assuming Mongoose knows that 'User' and 'users' is the same collection.

From mongoose docs for Mongoose.model:

The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural version of your model name. 

Also, if you pass a third string to your Mongoose.model, you can force mongoose to create a collection of that name instead of pluralizing it.



## Survey creation route handler
- Always import the models somewhere in the project, most likely in index.js

- Survey routes file to define POST req handler for /api/surveys
- 2 things to keep in mind while creating the survey route handler
    - User should be logged in
    - User have enough credits => 1 credit = 1 survey

```
const requireLogin = require('../middlewares/requireLogin');

module.exports = app => {
  app.post("/api/surveys", requireLogin, (req, res) => {}); //use the middleware to check auth
};
```

In index.js -
`require("./routes/surveyRoutes")(app); //calling the route func immediately with the app obj`



## Verifying min credits
- Make another middleware to check if the `req.user.credits < 1`, then throw an error
- Wireup the route handler with the middleware


## Creating Surveys
- when the req comes to /api/surveys, it should contain some properties inside req obj. Eg: title, sub, body, recipients
- create new instance of survey
   - require Survey model class inside the route handler file
   - extract the data out of req.body
   - create a new instance/record by assigning the values from req.body to the properties of survey model

```
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");

//requiring mongoose model class
const Survey = mongoose.model("surveys");

module.exports = app => {
  app.post("/api/surveys", requireLogin, requireCredits, (req, res) => {
    const { title, subject, body, recipients } = req.body;

    //creating instance of survey
    const survey = new Survey({
      title: title,
      subject, //es6 syntax
      body
    })
  });
};
```



## Creating Subdocs Collection

Survey instance
title: 'my title'
subject: 'my subject'
body: 'feedback pls'
recipients: ---------------> recipients subdocs collection
(comma separated str. of emails)

Recipients subdocs collection
{email: 'me@xyz.com'}
{email: 'abc@xyz.com'}
{email: 'test@xyz.com'}
Array of objects


So transform arr. of strings to arr of objects

- How we do it?
  - email@example.com,me@two.com,user@google.com -> split(',')

  - array of strings
    [email@example.com
    me@two.com
    user@google.com] -> map

  - array of objects
    {
      email@example.com
    }
    {
      me@two.com
    }
    {
      user@google.com
    }

```
recipients: recipients.split(",").map(email => {
        return { email: email };
      })
 ```     

- Link survey to current user for _user property

```
_user: req.user.id,
dateSent: Date.now()
```



> Note:

`recipients: recipients.split(',').map(email => ({ email: email })), `

Just one issue - remember that the list of emails is supposed to be separated by commas and spaces.  We split by commas here, but there still might be some trailing or leading spaces on each email.  As such, we should make sure that we cut out any extra white space. So make sure you change this line of code to read:

`recipients: recipients.split(',').map(email => ({ email: email.trim() })),` 



## Creating mailers
- Till now created an instance of a survey on memory. Its not yet saved in the db.

- How we take survey obj to use it to create and send email to all the diff recipients.
- This POST api endpoint -> /api/surveys is for creating a new survey and send out a big email containing a list of email addresses.


Create new survey instance -> attempt to create and send email -> email sent successfully? -> save survey! -> survey handler complete


> Work flow

  - Survey instance and Email template => Mailer (email generation helper) -> http request -> send 'mailer' to email provider
  - Survey instance tells the data inside the mail (data layer), and email template is the design/structure of the email, contains html or body of the mail (view layer).
  - Survey instance and email template are merged together inside 'mailer' object
  - Mailer obj represents one single email that is sent to list of people.
  - We're not interfacing with some email server directly, instead we use an API that automatically sends these emails.



  ## Identifying unique users
  - Communicating mailer to email provider is complicated process!

> BAD EMAIL APPROACH:
Recipient -> mailer -> send email
Recipient -> mailer -> send email
Recipient -> mailer -> send email
Recipient -> mailer -> send email
...


- For every single recipient inside the recipient list, create a separate mailer object, then send that mailer to email provider   on a separate http req, which will then send the email to the individual recipient

- 10,000 req to send email for one survey!


> GOOD EMAIL APPROACH:
All Recipient -> One mailer -> email provider -> send to individual recipient

- 1 request to send email


Drawbacks of this approach
- Since evryone gets the exact same mail containing exact same links Yes/No, how will we understand who clicked on a link?
- How to uniquely identify people?
- Prevent duplicate votes
- Everyone gets the exact same mail, so we cant put a token on mail

Solution: we want something like this to get user info/user email  -> surveystark/surveys/feedback/123/no/user@example.com

Email provider we use => `sendgrid.com`

- Whenever we sendgrid to send out an email to one of user, sendgrid looks the body of the email, and if any link is present, it automatically replace the link with customized link that send the users to their own servers (own sendgrid server).

- And they do this to build a collect metrics on what links are being clicked. So sendgrid records analytic info about the user.


Sendgrid sends email ----> sendgrid scans the email, replaces every link with their own special one (sendgrid knows who the recipient of every email is! The links they inject into the email contains a token that identifies the user!) ----> user clicks a link ---> sendgrid knows who clicked it! ---> User sent to their destination (user happy) and Sendgrid sends a msg to our server telling us about the click (webhook)


- Webhook is  anything where some outside API is facilitating a process and then gives our application some type of callback/notice that some event occured.

So, POST `/api/surveys/webhooks` (records feedback from a user) -> this route only sendgrid accesses and send it in some intervals to tell notification that someone clicked, here's the info.    