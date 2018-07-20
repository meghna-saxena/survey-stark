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

  //route handler to test someone who is logged into the application can get access to user record
  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
};
