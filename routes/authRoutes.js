const passport = require("passport");

// exporting this function containing the route handlers from this file
module.exports = app => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );

  app.get("/auth/google/callback", passport.authenticate("google"));

  //logout route handler
  app.get("/api/logout", (req, res) => {
    //passport attaches this func to req object
    req.logout(); //takes the cookie which contains user ID and kills the ID
    res.send(req.user);
  });

  //route handler to test someone who is logged into the application can get access to user record
  app.get("/api/current_user", (req, res) => {
    //passport attaches the req.user property to the req object
    res.send(req.user);
  });
};
