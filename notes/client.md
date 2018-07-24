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
- In prod, CRA takes all the files, run webpack babel, and save the final prod build of our app in the build folder. React code will be wrapped up into a bundle.js asset that will be served by the Node / Express server. 

Browser -> bundle.js -> Node/express API -> public assets
Browser -> data from API -> node/express api/server


## Why this architecture?
Why we're not using 2 distinct servers to serve their purpose in dev mode, why is data/api not served from the express server directly without using proxy at CRA server level? Why we use proxy?

1. Issue #1
Since we use cookies for auth.
Once the user goes in auth flow, set-up some info (user id)  in cookie which identifies user and every followup req will contain that user id

When a browser at localhost:3000 makes AJAX req to -
 - - Server hosted at localhost:3000 -> Cookies will be included in the req
 - - Server hosted at localhost:5000 -> Cookies will NOT be included in the req! (by default) because browser is currently pointed at localhost:3000

 This is purely a security issue. Browser assumes your app has malicious javascript. 
 Different ports count as diff domains.

> This issue can be solved by proxy server. Since browser will redirect at localhost:3000, but proxy will rediret to localhost:5000. So cookies is included by browser and prxy forward the req and cookie to express api


> Note: In prod, there's no cross-domain issue at all!


2. Issue #2
When browser at localhost:3000 makes req to server located at localhost:3000 - No issue
When browser at localhost:3000 makes req to server located at localhost:5000 - A diff domain/port, due to browser security reasons considered as a CORS request! 

- CORS - Cross origin resource sharing
- Proxy helps to prevent this problem.

________________________________________________________

## Complete OAuth flow
________________________________________________________

User clicks sign up -> broswer sees its relative path `/auth/google` so it automatically apends `localhost:3000/auth/google` -> req goes to other route which is CRA server + proxy -> proxy copies req and sends req to new route `localhost:5000/auth/google` -> req reaches to express api -> start oauth flow for google. On return, go to callback URL `/auth/google/callback` which is specified in  google strategy -> response sent back to proxy and sent back to browser -> On browser when we get redirected by google the relative path becomes `localhost:3000/auth/google/callback` -> goes to google.com which shows consent screen for app permission, the callback URL has the 'code' of the app -> on giving permission -> req sent back to localohst:3000 -> again req sent to proxy -. prxy sends to express api -> express takes user details -> response back logged in/cookies generated -> sent back to "/"