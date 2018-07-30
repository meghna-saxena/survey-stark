const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("./config/keys");
require("./models/User");
require("./services/passport");
// when we return authRoutes file it returns a function
// const authRoutes = require("./routes/authRoutes");

//connecting mongoose with mongoDB
mongoose.connect(keys.mongoURI);

// app decalaration
const app = express();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT);
