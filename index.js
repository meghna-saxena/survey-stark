const express = require("express");
const mongoose = require("mongoose");
const keys = require("./config/keys");
require("./services/passport");
// when we return authRoutes file it returns a function
const authRoutes = require("./routes/authRoutes");

//connecting mongoose with mongoDB
mongoose.connect(keys.mongoURI);

const app = express();

//called the function and assigned app obj as an arg to it
authRoutes(app);

// for refactoring we can also re-write
// require("./routes/authRoutes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
