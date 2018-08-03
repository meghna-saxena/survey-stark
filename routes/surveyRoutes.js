const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");

//requiring mongoose model class
const Survey = mongoose.model("surveys");

module.exports = app => {
    app.get("/api/surveys/thanks", (req, res) => {
      res.send("Thanks for voting!");
    });

  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
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

    //right place to send email
    const mailer = new Mailer(survey, surveyTemplate(survey));

    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      res.status(422).send(err);
    }
  });
};
