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
//handling routing in prod. for routes defined in clientside
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