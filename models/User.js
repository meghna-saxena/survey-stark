const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// es2015 destructuring, when property name and variable name are identical
const { Schema } = mongoose;

// create schema for new collection
const userSchema = new Schema({
    googleId: String
});

//create mongoose model class
mongoose.model('users',userSchema);