## Adding MongoDB

### Server structure refactor

- Refactor the entire code in index.js

```
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./config/keys");

const app = express();

// oauth flow by passport
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("accessToken", accessToken);
      console.log("refreshToken", refreshToken);
      console.log("profile", profile);
    }
  )
);

// created route handler
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

app.get("/auth/google/callback", passport.authenticate("google"));

const PORT = process.env.PORT || 5000;
app.listen(PORT);
```

- Make 3 folders inside the project:
- - config => protected API keys and settings
- - routes => all route handlers, grouped by purpose
- - services => helper modules and business logic. Contains all the passport and passport strategy logic
- index.js in the root project folder

### Theory of authentication

- Now we need to create new record in database -> set user id in cookie for this user -> kick user back to localhost:3000
  -> Logged in!

> Http is stateless!

- We communicate b/w browser and express web server by http requests. And when we talk about ajax req, they're also http req.
- Http is stateless means b/w any 2 req that we make http has no way to identify or share info b/w 2 separate requests
- Http is not for authentication purpose, since it cant identify b/w requests

Eg:
1st request -
Client (user clicks login with email/pass) => Server (you're logged in)

After 5 min, 2nd followup req -
Client (Get list of posts) => Server (who're you?)

The real picture of every authentication scheme -
Browser (click login) => Server (Logged in, plus gives some unique identifying piece of info to the user that made the original login req, include it with requests. Response includes cookie, token etc)

Browser (get list of posts, includes cookie, token, etc in req) => Server(identifies user123, gives the list of posts in response)

- Inside our app, we'll use cookie-based authentication
- When we get some initial req to server or express api, we'll set some header inside the response from the server to be sent back to browser.
- Header has a property called setCookie, and is set to some random token. Eg: setCookie: 'abfjfhdfk'
- Browser automatically strips off this token from the response and store it in browser's memory, and then browser automatically append that cookie with any followup requests being sent to the server.
- Therefore cookie is automatically managed by the browser

Cookie-based authentication has some shortcomings, so json web tokens (jwt) or other token-based strategies that dont involve cookies

- Extras:
- Using JWT's in the header of each request in the other course was a result of putting the react app on one domain and the API server on a different one. In a few lectures we dive really deep into talking about why the server setup in this course makes working with cookies possible. One of the nasty things around JWT's is that there isn't a great place to store them on the client side - they are almost always weak against XSS attacks. Using cookies solves that huge huge issue.

### Signing in users with OAuth

> `Email and password flow`

Time is passing -> Sign up (with email/pass) => Sign out => Login (email/pass)

Server compares if both email/pass combinations are same, if yes, the user is logged in!

> `OAuth flow`
> Time -> Sign up(with google profile) => Sign out => Login(google profile)

We need to find some unique identifying token in the user's Google profile. Is that consistent b/w logins? Use that to decide if the user is same.


Google allows to associate multiple email addresses with your account, so over time a user may not have same email. So, email is not unique identifying token. Rather, use user ID, which is `Google ID` for a particular user. It doesnt change over time.

OAuth only service/purpose is to give us this unique identifying token, for making followup requests.

Anytime a user comes from google, we will assume they might have already signed up to our application.


> Flow chart

Browser(Signup with google profile) => Server(creates a new record of the user in db) => MongoDB(Creates new record of user123) => record list of surveys made by the user => After creating new record sends response back, cookie stating user id 123 => set cookie: 'abddjsghg' => login!



Browser(logout) => server(unsets cookie) => response setcookie: '' => logout!


Browser(Signup with google profile) => Server (checks the exisiting user records in db) => Mongo(find the user record) => server sends response of setcookie: 'ahjbdhdkj', with userid 123



### Intro to MongoDB
Till now we know how to use OAuth to uniquely identify users inside of our application.


React app <--> http req (JSON) <--> express/node API -> mongoose.js -> mongoDB

Mongoose is a lib which makes working with mongoDB easier.


### How mongo internally stores info

MongoDB -> 
- Internally stores records into diff collections, every diff collection can have many records. Inside one mongoDB instance we can have collection of users, posts, payments

- Collection, contains many records


Users collection can have many records. Every record contains a little snippet of JSON/ js object(key:value pair) -
{
    id: 1,
    name: 'anna',
    height: 150
}

{
    id: 2,
    name: 'alex'
    age: 30
}

{
    id: 3,
    name: 'bill'
}

{
    id: 4,
    name: 'sam'
    height: 167
}

{
    id: 5
    name: 'zane'
}


- Important fact about mongoDB is its schema-less. In other words, inside of one single collection, every record can have its own distinct set of properties.

- This is in contrast to traditional db, like SQL, postgres or relational db, where every recors has exact same properties.


### What mongoose is doing? How it relates to mongoDB?

JS world -> This is from Mongoose(Model class) -> MongoDB world(Collection)


JS world  -> This is from Mongoose (Model instance) -> MongoDB world({id: 1, name: 'alex'} {id: 2, name: 'sam', age: 30} {id: 3, name: 'bill} )


- Model class 
It is created with mongoose represents an entire mongoDB collection. It is used to access a single collection inside mongoDB. 
Model class has some func attached to it, which are used to work with an entire collection.
Eg: creating new record, or searching all the records.

- Model instance
Mongoose gives access to model instances, which are javascript objects that represent single records inside the collection.

So in practise, we have one model class representing one collection, and many model instances representing each single records inside the mongoDB collection.



### MongoDB setup

2 diff ways to set in own express apps.

1. Either install a local copy of mongoDB on personal laptop/desktop
2. Or use remotely hosted instance of mongoDB

Here, we'll use the latter. Reason: Its far easier to install mongoDB and create a local copy when it is remotely hosted.

Therefore, use a third-party service to host a copy of mongoDB. So on this remote service , we will have our running mongoDB copy, and on our local comp we will have our express api server and react app as well.

```
Our local computer -> React app <-> express/node api -> mongoose.js -> mongoDB(hosted remotely)
```


Create remotely hosted copy/instance of mongoDB 
`https://mlab.com/`



### Connecting mongoose to mongo
- Install mongoose on express api and then connect with the remotely hosted mongoDB
`mongoose.connect(keys.mongoURI);`


Mongo and mongoose installed!
- Need to be able to identify users who signup and return to our app. We want to save the 'id' property of their google profile.
- Use mongoose to create a new collection in mongo called 'users'
- Collections are created by making a model class
- When user signs in, save new record to the 'users' collection


### Mongoose model classes
- With mongo we can have many random arbitrary properties on any record of a given collection. 
- However, mongoose wants to know all the diff properties that our record will have inside our db, and it requires to tell ahead of time with `Schema` object.
- So when we use mongoose we lose ability of diff properties on each individual record, since it wants to know all the diff properties.

- create schema for new collection
- schema describes what every individual property or individual record is going to look like.

```
const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// es2015 destructuring, when property name and variable name are identical
const { Schema } = mongoose;

// create schema for new collection
const userSchema = new Schema({
    googleId: String
});

//create mongoose model class
//'users' is collection name
mongoose.model('users',userSchema);
```



### Saving model instances
Create new record to `users` collection anytime new user signs up our app.

require mongoose inside passport.js, call the mongoose.model('users') and assign it new cont object User

Now use this User model class to create new model instances and save it to db

```
const mongoose = require("mongoose");

//one argument inside mongoose.model means we want to fetch something out of it, 2 args means load something into it
//now User object is model class
const User = mongoose.model("users");

// OAuth flow by passport
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      //new model instance to create individual records
      new User({ googleId: profile.id }).save(); //saves in the database
    }
  )
);
```

Error in server: schema hasn't been registered for model "users"
So mongoose thinks we've not loaded a schema into mongoose that describes "users"

Therefore, in index.js keep the require statements in following order -
require("./models/User");
require("./services/passport");


Note:
All the deprecation warnings in server is due to mongoose interaction with mongoDB, so ignore them.


### Mongoose queries