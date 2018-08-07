## Feedback with webhooks
- Show list of surveys on the dashboard
- When user clicks on yes/no lnk inside the email, it records the feedback to the particular survey

> Note

    -  Enabled click tracking inside emails that tell sendgrid to automatically replace every anchor tags with a custom link. The links they inject into the email contains a token that identifies the user.
    - Sendgrid then sends a msg to our server about the click
    - This relationship of sendgrid sending an automated msg to backend server is referred as `web hook`
    - Webhook is when one server makes communication with another server because of some event that occured on first one.


## Webhooks in development

Lifecycle of a webhook:

- User clicks link, 2sec later another user clicks link, 5 sec later another user clicks link
 
=> sendgrid records click => sendgrid waits for a bit => `sendgrid makes a POST req to our server` with data about all the clicks in the last `30sec` or so.

- So instead of getting many single req, we get 1 big req containing all diff click events.


> In production

- Sendgrid makes a post to our server with data about all the clicks in the last 30s or so => POST surveystark.com/surveys/webhooks => we process a list of clicks on API


> In development

Sendgrid makes a post to our server with data about all the clicks in the last 30s or so => POST ???? => localhost:5000 is meaningless to sendgrid

- So we'll use a package k/a `local tunnel`

> In development (contd.)

- Web:
    - Sendgrid makes a post to our server with data about all the clicks in the last 30s or so => POST webhookhelper.localtunnel.com => 

    Local:
        - Localtunnel server on our computer => POST localhost:5000

- Localtunnel allows you to easily share a web service on your local development machine without messing with DNS and firewall settings.
- Localtunnel will assign you a unique publicly accessible url that will proxy all requests to your locally running webserver
- installed inside the server project
- Modify the server/package.json 

```
"dev": "concurrently \"npm run server\" \"npm run client\" \"npm run webhook\"",
"webhook": "lt -p 5000 efevffrt" 

lt - local tunnel, p - port, unique subdomain where req will come

```

- When we start the server on the terminal, we can see - our url is: https://strong-crab-76.localtunnel.me, sendgrid will send the req at this url