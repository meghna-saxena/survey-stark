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

- How to run both the servers at the same time?
 - - Split the terminal window, and run express server by `yarn run dev` and react server by `yarn start` commands.
 - - Or use a `concurrently` package to run 2 separate servers by single command.

 Inside server (package.json), configure the client and server scripts, and add a dev script saying to run concurrently both the servers.


 ## Routing stumbling block
 - Show a link in reap app, saying login by google Oauth
 - We know that for going in OAuth flow we need `localhost:5000/auth/google`
 - Express server has auth flow on `/auth/google`

 - If you provide a relative link in the react app => `<a href="/auth/google">Sign in with Google</a> `, not specifying the domain. Then browser automatically assumes that you are trying to visit that relative path on the same domain that you're currently visiting, which currently is localhost:3000

 - However oauth flow is on express server which is hosted on port 5000

 - To solve this problem, manually specify the domain. 
 `<a href="http://localhost:5000/auth/google">Sign in with Google</a> `

 - But this link only work on development env on our local machine. In prod, when the app is deployed on heroku, change the address to heroku address.
 - So essentially to make the app working, whenever the app is deployed, dynamically find every <a> tag, every API req and flip it from localhost:5000 over to heroku app address. - And this is a `stumbling block`

- So, for a good codebase, we just want to write the relative path `/auth/google` and not care if it's hosted on localhost:5000 api or heroku app api. We can do this by writing helper func giving a check to see if we're in prod or dev env

- But instead we will do a small fix to make the backend and frontend server work together, by configuring in package.json of client directory =>
```
"proxy": {
    "/auth/google": {
      "target": "http://localhost:5000"
    }
  },
```
This will automatically redirect to express server.


## Create react app's proxy
- When we use relative link, browser automatically append the current domain infront of link, which is localhost:3000
- We get a redirect_uri_mismatch, since google thinks we want to navigate to `localhost:3000/auth/google/callback`, so add this link as authorized callback in google developer console.
- In prod, however, the current domain will append with the relative link so it will work just fine!

> Dev mode Diagram

Browser -> bundle.js -> create-react-app served by `react server` 
Browser -> data from API -> proxy in `react server` -> node/express api/server


> In production
- React server doesn't exist!
- In prod, CRA takes all the files, run webpack babel, and save the final prod build of our app in the build folder

Browser -> bundle.js -> Node/express API -> public assets
Browser -> data from API -> node/express api/server

