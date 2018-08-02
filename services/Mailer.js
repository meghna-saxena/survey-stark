const sendgrid = require("sendgrid");
const helper = sendgrid.mail;
const keys = require("../config/keys");

class Mailer extends helper.Mail {
  constructor({ subject, recipients }, content) {
    super();

    this.sgApi = sendgrid(keys.sendGridKey);

    this.from_email = new helper.Email("no-reply@surveystark.com");
    this.subject = subject;
    this.body = new helper.Content("text/html", content);
    this.recipients = this.formatAddresses(recipients);

    // register the body with the email/mailer itself
    this.addContent(this.body);

    //tracking clicks
    this.addClickTracking();
    this.addRecipients(); //takes the formatted list and register with the actual email
  }

  formatAddresses(recipients) {
    //arr of obj containing emails
    return recipients.map(({ email }) => {
      return new helper.Email(email); //turn each recipient into one of these helper.Email thing, arr of helper obj
    });
  }

  //funct to track/scan clicks by sendgrid
  addClickTracking() {
    const trackingSettings = new helper.TrackingSettings();
    const clickTracking = new helper.ClickTracking(true, true);

    trackingSettings.setClickTracking(clickTracking);
    this.addTrackingSettings(trackingSettings);
  }

  addRecipients() {
    const personalize = new helper.Personalization();

    this.recipients.forEach(recipient => {
      personalize.addTo(recipient);
    });
    this.addPersonalization(personalize);
  }

  async send() {
    const request = this.sgApi.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: this.toJSON()
    });

    const response = await this.sgApi.API(request);
    return response;
  }
}

module.exports = Mailer;
