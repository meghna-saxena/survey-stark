# Moving to the client side

## React app generation
- Automatic reloading
- Linting
- Good error reporting
- Use create react app which is a global npm module and then use it for react app generation


## A separate frontend server
CRA project have their own built-in server

- When we have an express app, why are we using react app with its own server?
- Right now we have a 2nd server running for our development environment.

> 2 servers architecture =>

React server => Button.js/ app.js/ header.js => JS stuff => browser
Express server => MongoDB => JSON stuff => browser

- Express server pulls some info from mongo and then responds to req that browser makes with some amount of JSON, eg. user model/ auth flow etc. Express server is solely concerned with generating/serving JSON data.

- React server takes bunch of component files, bundle them together by using webpack and babel and give a single bundle.js file that will be loaded in the browser.

- So one server for serving frontend application assets and second server for serving all the diff data inside our app.

> Notes:

- We can build an express server we can also put all the logic of bulding a react app and serving it in the browser. The one simple reason why we dont do that way =>

Because CRA is the best way to build react apps. It has pre-built config already placed, that it saves a lot of time.


## Running the client and server
