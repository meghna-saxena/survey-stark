const mongoose = require("mongoose");
const { Schema } = mongoose;

//create schema for new collection
const surveySchema = new Schema({
  title: String,
  body: String,
  subject: String,
  recipients: [String], //array of string, and every str is individual email address
  yes: { type: Number, default: 0 }, //when 2 properties have to be passed, make an obj
  no: { type: Number, default: 0 }
});

//create mongoose model class
mongoose.model("surveys", surveySchema);
