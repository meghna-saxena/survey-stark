const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// es2015 destructuring, when property name and variable name are identical
const { Schema } = mongoose;

// create schema for new collection
const userSchema = new Schema({
  googleId: String,
  credits: { type: Number, default: 0 }
});

//create mongoose model class
//'users' is collection name
mongoose.model("users", userSchema);
