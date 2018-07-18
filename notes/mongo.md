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
 -  Using JWT's in the header of each request in the other course was a result of putting the react app on one domain and the API server on a different one.  In a few lectures we dive really deep into talking about why the server setup in this course makes working with cookies possible.  One of the nasty things around JWT's is that there isn't a great place to store them on the client side - they are almost always weak against XSS attacks.  Using cookies solves that huge huge issue.  