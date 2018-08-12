const _ = require("lodash");
const Path = require("path-parser").default;
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");

//requiring mongoose model class
const Survey = mongoose.model("surveys");

module.exports = app => {
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false //not returning recipient list in the response
    });

    res.send(surveys);
  });

  app.get("/api/surveys/:surveyId/:choice", (req, res) => {
    res.send("Thanks for voting!");
  });

  app.post("/api/surveys/webhooks", (req, res) => {
    const p = new Path("/api/surveys/:surveyId/:choice");

      const events = _.map(req.body, event => {
        console.log("Got event in webhook", event);
        if(!event.url) {
          console.log("No url in event, returning.")
          return;
        }

        const pathname = new URL(event.url).pathname;

        const match = p.test(pathname);
        if (match) {
          return {
            email: event.email,
            surveyId: match.surveyId,
            choice: match.choice
          };
        }
      });

      const compactEvents = _.compact(events); //will remove el which are undefined inside the arr of click objects
      const uniqueEvents = _.uniqBy(compactEvents, "email", "surveyId"); //removes duplicate records
      
      const updatedSurvey = _.each(
        uniqueEvents,
        ({ surveyId, email, choice }) => {
          Survey.updateOne(
            {
              _id: surveyId,
              recipients: {
                $elemMatch: { email: email, responded: false }
              }
            },
            {
              $inc: { [choice]: 1 }, //choice = 'yes' || 'no'
              $set: { "recipients.$.responded": true },
              lastResponded: new Date()
            }
          ).exec();
        }
      );

      res.send({});
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
