## Express app with CRA in production
- Till now we were just deploying express server
- How our server works inside prod. vs dev?
- Build process on clientside of app?


> In dev mode -

localhost:3000

    - bundle.js <-> CRA
    - data from API <-> proxy <-> node/express api 


> In prod mode -
    - bundle.js <-> node/express API <-> punlic assets
    - data from API <-> node/express API



- `npm run build` builds a prod version of all the assets inside `client side of project`.
- All the files generates under client/build/static

Workflow for getting files in prod -

Browser -> /api/stripe -> express server    
Browser -> /surveys -> express server -> index.html
Browser -> /client/build/static/js/main.js -> express server -> main.js


- Just like /surveys is not defined in express, it is configured by react-router, there are some routes handled by express and some by react-router. So express gives index.html for unknown routes handled by react.
- Inside index.html, there's script tag to load js bundle



## Routing in production
- How express will deal with some routes, it doesnt have route handler of?

```
/handling routing in prod. for routes defined in clientside
if (process.env.NODE_ENV === "production") {
  //Express setsup prod. assets like main.js, main.css
  app.use(express.static("client/build"));

  //Express serves index.html, if it doesnt recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
```


## Deployment options
- `npm run build` is a one-time step for the current codebase. So if you make changes later, you have to build again.
- Anytime we deploy to heroku, first build the project and then deploy
- By convention we dont commit build dir to git

Deployment options -

#1 Build client project -> Commit built project -> push to heroku
- Breaks convention of not commiting build to git. Here you commit build files to git

#2 Push to heroku -> Heroku installs *all* dependencies for client projct -> Heroku builds client project
- Downside heroku installs unnecessary dependencies on prod. server which are used for dev environment only.


#3 Push to CI (Continous integration) -> Run test & stuffs -> CI builds and commits client -> CI pushes build to heroku
- More common
- Use 3rd party server to build the application
- Sometimes its an overkill, since it need to run tests on codebase
- Refer circleCI


> Notes
localhost is the hostname of your computer, 3000 and 5000 are ports that are used by processes to serve the applications. In this case the Express server uses port 5000 while the Webpack development server for the client side uses 3000. In production you would create an asset, the bundle.js file which is the entire client side code, transpiled, minified and uglified. That file is served by a web server directly such as express or nginx etc. 



## Adding in a heroku build setup
- Choosing option #2 for deployment

Push to heroku -> heroku installs server deps -> heroku automatically runs `heroku-postbuild` -> we tell heroku installs client deps -> we tell heroku runs `npm run build` 


- refer customizing build process in heroku docs
- add script in server/package.json
- client package.json doesnt reach heroku, we just have backend server on heroku not cra server

- Added script -
`"heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"`