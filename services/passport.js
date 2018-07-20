const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

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
