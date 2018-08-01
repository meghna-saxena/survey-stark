const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");

//requiring mongoose model class
const Survey = mongoose.model("surveys");

module.exports = app => {
  app.post("/api/surveys", requireLogin, requireCredits, (req, res) => {
    const { title, subject, body, recipients } = req.body;

    //creating instance of survey
    const survey = new Survey({
      title: title,
      subject, //es6 syntax
      body,
      recipients: recipients.split(",").map(email => {
        return { email: email.trim() };
      }),
      // recipients: recipients.split(',').map(email => ({ email: email.trim() })), //es6
      _user: req.user.id,
      dateSent: Date.now()
    });
  });
};
