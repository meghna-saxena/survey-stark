# Developing the Client Side

## Aync/Await Syntax
ES2017 syntax

- Implementation
- - Inside passport.js, while using google strategy, the second argument was a callback funct. Inside of which we used promises with req to database to handle the async. nature of our code.

- - Async/await still works on promises, but it makes the code look synchronous, though behind the scenes it's still asynchronous working with promises.

Example: 
```
function fetchAlbums() {
    fetch('https://rallycoding.herokuapp.com/api/music_albums')
    .then(res => res.json())
    .then(json => console.log(json));
}

fetchAlbums();
```

//made async. req that returns a promise.
//To know that promise has resolved, we chain on .then
//.then() called if req is successful with the value returned from the async req

//fetch returns a promise
// - .then(res => res.json()) fetch resolves its promise with an object that represents the underlying request. You can get the real json response by calling '.json()' on it. This returns another promise
// - .then(json => console.log(json)) after getting the json, console log it


// New syntax for handling promises easily

```
const fetchAlbums = async () => {
    const res = await fetch('https://rallycoding.herokuapp.com/api/music_albums')
    const json = await res.json()
    console.log(json);
}

fetchAlbums();
```

//put async keyword infront of function declaration, tells js that this func has async code. Infront of promises add await keyword


How to know if a function returns a promise?
Assign the return value in a variable and console log it, and you'll see the type is a Promise.


## Refactoring with async/await
- Database interaction is asynchronous!

- Refactored the callback function in google strategy -

Older: 

```
(accessToken, refreshToken, profile, done) => {
      //initiate mongoose query
      //look thru User collection and find first record with googleId: profile:id
      User.findOne({ googleId: profile.id }).then(existingUser => {
        if (existingUser) {
          // we already have a record with a given profile id
          done(null, existingUser);
        } else {
          // we dont have a record with the id, make a new record
          //new model instance to create individual records
          new User({ googleId: profile.id })
            .save() //saves in the database
            .then(user => done(null, user));
        }
      });
```

New:

```
async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      const user = await new User({ googleId: profile.id }).save(); //saves in the database
      done(null, user);
    }
  )
```


## Frontend tech

Server setup -> authentication flow(server) -> client setup -> auth on client -> add survey APIs on server -> add survey stuff on client

Our frontend routes -

projectname.com - Header, landing components
projectname.com/surveys - Header, dashboard, surveylist, surveylist item components
projectname.com/surveys/new - surveryform, formfield component


## Client react setup
- Deleted all the files inside client/src folder except registerServiceWorker.js

> Building from scratch:

- Essentially 2 root files. 
 - Index.js contains the initial bootup logic of react and redux.So it contains the redux logic as well
 - App.js is a component for rendering on screen, so it contains the logic of react-router

index.js (Data layer control) -> App.js(Rendering layer control)


> Components overview:

index -> app -> Landing/Header/Dashboard/SurveyNew
Dashboard -> SurveyList -> SurveyListItem
SurveyNew -> SurveyField


- Install following dependencies - redux, react-redux, react-router-dom
- Create index.js and render a root component to DOM


> Notes:
  - If a given file is exporting class or a react component of any type, whether functional or class based component, label the file with capital initial letter. But if the file returns a function or just a series of func. label it with lowercase.

  - We use imports statement in frontend because webpack and babel support es16 modules whereas on backend nodejs supports only commonjs modules till now.

  - <App /> is component's instance

  - QuerySelector vs GetElementById? What is the diference between:
`ReactDOM.render(<App />, document.querySelector('#root')); ` and `ReactDOM.render(<App />, document.getElementById('root'));` 

   - querySelector is used to query any element based on a class, ID, or type, similar to how jQuery works. Both do the same thing, but getElementById is more specific, so it is slightly better for performance than querySelector. 
   - QuerySelector  => return any elements (class, div, id, etc..)
   - getElementById => strictly return Id element only