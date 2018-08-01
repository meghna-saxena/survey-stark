const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
require("./models/User");
require("./models/Survey");
require("./services/passport");
// when we return authRoutes file it returns a function
// const authRoutes = require("./routes/authRoutes");

//connecting mongoose with mongoDB
mongoose.connect(
  keys.mongoURI,
  { useNewUrlParser: true }
);

// app decalaration
const app = express();

//parses the incoming req from stripe api to get the token
app.use(bodyParser.json());

// tells express to use cookies inside app
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());

//called the function and assigned app obj as an arg to it
// authRoutes(app);

// for refactoring we can also re-write
require("./routes/authRoutes")(app);
require("./routes/billingRoutes")(app);
require("./routes/surveyRoutes")(app); //calling the route func immediately with the app obj


//handling routing in prod. for routes defined in clientside
if (process.env.NODE_ENV === "production") {
  //Express setsup prod. assets like main.js, main.css
  app.use(express.static("client/build"));

  //Express serves index.html, if it doesnt recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
