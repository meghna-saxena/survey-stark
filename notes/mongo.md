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
- Create only one user record for a given googleID

- Send req to google with 'code' included
- Get user details
- Do we already have a user with this profile ID in the db?
- If no, create a user!
- If yes, skip user creation!

Therefore query the exisitng collection.

We already have access to model class which represents the entire underlying collection of records that exists inside db. We use the model class to search over all the records inside that collection.

use findOne() method over the User model class

```
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
    //initiate mongoose query
      //look thru User collection and find first record with googleId: profile:id
      User.findOne({googleId: profile.id});

      //new model instance to create individual records
      new User({ googleId: profile.id }).save(); //saves in the database
    }
  )
);

```


Whenever we reach to mongoDB, be it for search thru collection or saving a new record or edit or delete exisiting record, we're initiating an async action

`MongoDB` interaction eg Query doesn't returns a user, instead it `returns a promise`. A promise is a tool in js for handling async code.

```
...
(accessToken, refreshToken, profile, done) => {
      //initiate mongoose query
      //look thru User collection and find first record with googleId: profile:id
      User.findOne({ googleId: profile.id })
      .then(existingUser => {
        if (existingUser) {
          // we already have a record with a given profile id
        } else {
          // we dont have a record with the id, make a new record
          //new model instance to create individual records
          new User({ googleId: profile.id }).save(); //saves in the database
        }
      });
    }
  )
);
```



> Notes

Q) How would you (or I) handle the use case where someone would be logging in with multiple Auths? How would we prevent the strategy from searching the db and creating an unnecessary new User in the case that they had auth'd with Google and now are auth'ing with IG? 

> Only way to handle this is to store the email given to you by the provider.  Remember that with google, in the profile object we got a list of the user emails.  We could store that list, then whenever someone signs in with another provider, check to see if that provider's emails have been used before from another provider.  

The thing to keep in mind is that this opens you up to account highjacking.  For example, imagine the following:

- Bill signs up to our service with Google.  Bill's google profile shows an email of bill@gmail.com

- Hacker Jill then creates an account on Instagram and enters a fake email address of bill@gmail.com.  

- Hacker Jill then comes to our site and tries to oauth through instagram

- Our server might see the instagram profile email of bill@gmail.com, and - unless we guard against it - we might incorrectly link bill's account with this new instagram oauth

To guard against this, do the following:

- Bill signs up with Google, and we create a new account that contains an email of bill@gmail.com

- Bill logs out, then comes back to our site and attempts to oauth with Instagram.  Let's imagine that instagram also lists bill@gmail.com

- We must detect that Bill already has an account tied to google

- After detecting that Bill already has a user account, we will only allow Bill to auth through Instagram and link this account if Bill is signed in with Google

In other words, only allow account linking if the user is already signed in with the other account.  That proves that Bill is who they say they are and that both the Instagram and Google accounts belong to him.

I know this sounds hard, but it isn't as bad as it sounds.  To pull it off, every use model record store the the list of emails from each provider that the user auths with.  Then, in each strategy you wire up, check to see if the user's email is already in use.  If it is, check to see if the user is logged in (by looking at req.user).  If they are, allow them to pass, otherwise tell them the email is in use and that they should go sign in with the other oauth provider first.



### Passport Callbacks

Google strategy gives us this callback - 

Steps:

- Send req to google with 'code' included
- Get user details
- Do we already have a user with this profile ID in the db?
- If no, create a user!
- If yes, skip user creation!

- Call 'done' with the user that was created or found!
(Tell passport that we have finished creating a user & it should now resume the auth process)

`done func.` tell passport that we're finished executing the code, resume the auth flow.

```
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      //initiate mongoose query
      //look thru User collection and find first record with googleId: profile:id
      User.findOne({ googleId: profile.id }).then(existingUser => {
        if (existingUser) {
          // we already have a record with a given profile id
          done(null, existingUser);
        } else {
          // we dont have a record with the id, make a new record
          //new model instance to create individual records
          new User({ googleId: profile.id })
            .save() //saves in the database
            .then(user => done(null, user));
        }
      });
    }
  )
);

```



### Encoding users
In the OAuth flow, the last step is, after the user record has been created, server sends a response back with the cookie (token containing some identifying piece of info) having the user ID which will be include in all the flowup requests from the browser to the server.

> Cookie flowchart:
 
 - Browser(click sign in with google profile) => Server (Looks like you've same google profile ID as user123. Take a token that says you're user123 ) => Call `serializeUser` with the user to generate the identifying piece of info => set-cookie: 'asjkahlds' => response to Browser


- SerializeUser is a func automatically called by passport with our user model that we've just fetched. After generating piece of info, it is passed back to passport and passport automatically stuff that token into user's cookie

 - Browser(list of posts?) => included the cookie: 'asaldjsd' => Server(takes identifying piece of info from cooki, pass into `deserializeUser` to turn it into a user) => Ah, user123. Here's your list of posts => posts => browser


_____________________________________________________

```
//user model which we have retrived from the db
//by the callback func of google strategy
passport.serializeUser((user, done) => {
  //first arg null represents that no error occurs
  //user.id is identifying piece of info for followup req
  //user.id is _id provide by mongo for every record
  done(null, user.id);
});
```

> _id property inside mongo collection's record is a unique identifier automatically generated by mongo.

Reason why we're using it?
Because we can be using multiple auth providers like fb, twitter etc., and if we have them, we can't always assume that user has a google ID. But we can assume that every user will have an _id (user.id)


> `OAuth's only purpose is to allow someone to sign in. After that, we use own internal ID's`

- `Google Oauth flow` => google profile id -> identifies a user coming to us from the OAuth flow
- `Incoming req with cookie` => user model instance id -> identifies a user who is stored in the database


> Notes:

'User' refers the users model class, while 'user' refers to instance of a particular user. 

const user = new User({googleId: profile.id}); 
which essentially says, create a new instance of the User (model class) with the googleId property set = profile.id. 


_______________________________________________________

new User({ googleId: profile.id })  // this line creates the new User instance in User model
.save()
.then(user => done(null, user));   //why we used a promise here and pass user?

We need the .then() promise to the pass the user back to the BROWSER. 

There are two different things happening here:

1. A new user is being instantiated and then saved in our DATABASE

then...

2. Once the saving of the user is complete, it is being passed back to the BROWSER using the promise that you just pointed out.

to continue forward...

3. This entire user is then automagically passed to the 'req' parameter by passport (we don't have to do anything there). That's why in the routes file where we create an api at '/api/current_user' we do the following: 

..res.send(req.user)  // we make the user object and its contents available to our front end. The req.user would have been empty if we would not have used the promise that you pointed out. 



### Deserialize User

Take the id stuffed in the cookie and turn it back into an actual user model.

```
passport.deserializeUser((id, done) => {
  //findByID finds record of a particular id
  User.findById(id).then(user => {
    done(null, user);
  });
});
```

Instruct passport to manage all of the authentication by using cookie. Passport if basic set of helpers to handle authentication. It has many ways to keep track of user, one of which is cookies