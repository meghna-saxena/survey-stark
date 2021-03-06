const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

//one argument inside mongoose.model means we want to fetch something out of it, 2 args means load something into it
//now User object is model class
const User = mongoose.model("users");

//user model (model instance) which we have retrived from the db
//by the callback func of google strategy
passport.serializeUser((user, done) => {
  //first arg null represents that no error occurs
  //user.id is identifying piece of info for followup req
  //user.id is _id provide by mongo for every record
  done(null, user.id);
});

//Take the id stuffed in the cookie and turn it back into an actual user model.
passport.deserializeUser((id, done) => {
  //findByID finds record of a particular id
  User.findById(id).then(user => {
    done(null, user);
  });
});

// OAuth flow by passport
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      //initiate mongoose query
      //look thru User collection and find first record with googleId: profile:id
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        // we already have a record with a given profile id
        return done(null, existingUser);
      }

      // we dont have a record with the id, make a new record
      //new model instance to create individual records
      const user = await new User({ googleId: profile.id }).save(); //saves in the database
      done(null, user);
    }
  )
);
