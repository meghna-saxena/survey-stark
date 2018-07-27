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
  `ReactDOM.render(<App />, document.querySelector('#root'));` and `ReactDOM.render(<App />, document.getElementById('root'));`

- querySelector is used to query any element based on a class, ID, or type, similar to how jQuery works. Both do the same thing, but getElementById is more specific, so it is slightly better for performance than querySelector.
- QuerySelector => return any elements (class, div, id, etc..)
- getElementById => strictly return Id element only

## Redux Review

React, redux, react-redux

Store -> Provider -> App -> Dashboard -> SurveyList -> SurveyListItem

- Provider is a component that makes the store accessible to every component in the app.

> State management

Redux store -> combineReducers ->

- authReducer (records whether or not the user is logged in)
  OR
- surverysReducer (records a list of all surveys user has created)

* To determine current state or change the state, call an action creator which dispatches an action.
* Action is sent to all the reducers inside the app.
* Those reducers are combined together by combinerReducers call which updates the state in redux store.

## Redux Setup

```
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

//create new instance of redux store
// 1st arg is dummy reducer
//2nd arg is initial state of app, imp in serverside rendering, but right now just put empty obj {}
//3rd arg is middleware

const store = createStore(() => [], {}, applyMiddleware());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root")
);
```

## Auth reducer

```
export default function(state = {}, action) {
  //Since state initially is undefined, so set it to an empty obj {}
  switch (action.type) {
    default:
      return state;
  }
}
```

> combineReducers in reducers/index.js

```
import { combineReducers } from "redux";
import authReducer from "./authReducer";

export default combineReducers({
  auth: authReducer
});

//whatever keys we give to combineReducers are going to represent the keys of our state object.
```

## React router setup

- Put all the config around diff navigation states of our app into app.js
- App.js is responsible for view layer
- Import the objects {BrowserRouter, Route} from react-router-dom
- Wrap the root component with <BrowserRouter>. It can only have one child component.

* Whenever react router decides what component to render, its going to take current url and then try to match every single route path to current url from top to bottom. So "/" path matches to every route. So pass the "exact" property in route.

* Since header always needs to be present on all the routes, don't tie it with any route, just write it before all the route config.

```
<BrowserRouter>
           <div>
               <Header />
               <Route path="/" exact component={Landing} />
               <Route path="/surveys" exact component={Dashboard} />
               <Route path="/surveys/new" component={SurveyNew} />
           </div>
</BrowserRouter>
```

Oganizing these routes in a "first match route approach" instead of using "exact" props every time just to avoid showing parent route with the child route? What's the best use case?

```
<Route path="/surveys/new" component={SurveyNew}/>
<Route path="/surveys" component={Dashboard}/>
<Route path="/" component={Landing}/>
```

- To do that, you would need to import Switch from react-router-dom and use it like this
- Notice the order of routes

```
<Header />
<Switch>
 <Route exact path="/" component={Landing} />
 <Route path="/surveys/new" component={SurveyNew} />
 <Route path="/surveys" component={Dashboard} />
</Switch>
```



## Materialize CSS
- Pre-styled css for any js frameworks
- Can also use react materialize or material-UI => React components that implement Google's Material Design.

- However material UI uses javascript based styling. So customizing is challenging.
- Using `yarn add materialize-css` in our project


## Webpack with CSS
Webpack is a module loader

CRA -> Webpack -> index.js -> App.js + materialize.css

- Webpack is not limited to processing of js files, it also utilizes loaders that instruct it how to handle other types of files as well.


- Hook up materialze css inside project
    - import 'materialize-css/dist/css/materialize.min.css'; inside index.js
    - when you dont give a relative path, webpack assumes automatically that you're referring to an npm module installed inside node_modules directory

- Materialize css assumes you have atleast one root comp called container, it then provide some margin on the sides.



## Current user API
 - How to decide if user is logged in?
 Comp -> action creator makes api req -> when req returns -> dispatch action -> sent to reducers -> updates state in store

 - So create action creator which makes ajax req to the route handler '/api/current_user'



## Additional proxy rules

React app boots up -> app component calls action creator -> func k/a fetchUser axios.get('/api/current_user') -> express API -> response (user model) -> use lib redux-thunk to dispatch(action) -> auth reducer -> new 'auth' piece of state -> update state -> header rerender 

- Hookup reduxThunk with createStore in index.js as middleware
`const store = createStore(reducers, {}, applyMiddleware(reduxThunk));`

- Remember action creator are where we initiate change inside of redux side of our app.
- Actions are plain JavaScript objects. Actions must have a type property that indicates the type of action being performed. Types should typically be defined as string constants

- Fetch is kind of a pain to use - it doesn't include cookies by default on requests, it has weird error handling, and you have to do that nasty 'res.json()' step before accessing the response.  Yes, we could easily write a wrapper around fetch to fix it up, but its just easier to use axios instead.  Axios essentially contains the code we'd be writing by hand anyways!

- set another proxy

```
"proxy": {
    "/auth/google": {
      "target": "http://localhost:5000"
    },
    "/api/*": {
      "target": "http://localhost:5000"
    }
  },
```


## Basics of Redux Thunk

- Redux expects that any action creator will instantly return an action.
- An action is a js object with a type property and optionally a payload.
- Purpose of redux thunk is to allow us to write a.c that break the specific requirement for immediately returning an action.
- Dispatch function -> dispatch sends the acion to diff reducers in the store, causing them to instantly recalculate the app state.
- Dispatch func is a funct. belong to redux store
- So a.c instead of returning an action, they produce an action which is forwarded to dispatch func. We get an access to this function.


Instead of returning an action like this -

```
const fetchUser = () => {
  const request = axios.get("/api/current_user");
  return {
      type: FETCH_USER,
      payload: request
  }
};
```

Redux thunk gives access to dispatch func, and then we can manually control when we want to dispatch an action -
- Since req is async

```
const fetchUser = () => {
  return dispatch => {
    axios
      .get("/api/current_user")
      .then(res => dispatch({ type: FETCH_USER, payload: res }));
  };
};

```


Note:
Redux Thunk allows your action creators to return a function instead of returning an action object. This function gives you access to the dispatch function, and allows you to dispatch multiple actions as you please. You can dispatch actions when certain conditions are met. Redux Promise on the other hand, allows your action creators to return a promise as the payload. You can use both Redux Thunk and Redux Promise in your applications based on the situation. If there is a lot of complexity or a need for conditonals, Redux Thunk is the way to go. But let's say you have multiple promises and also have the need for conditionals at the same time, you will be using both



## Refactoring the app
- Add the action creator to one of the component.
- Add the auth a.c inside app.js, since the whole app needs the logic.
- We want to fetch the current user, so to get access to lifecycle method, refactor to class based comp
- Use componentDidMountto call initial ajax req. since instance of the comp is mounted/rendered, so fetch the current user
- Wire the app with redux store by {connect} helper.
- Wrap the app with connect
`export default connect(null, actions)(App);`
- All the actions are assigned to App as props. So access to them by this.props

```
 componentDidMount() {
      this.props.fetchUser();
}
```

- If you console the action in authReducer, then on rebooting the react app, you can see the a.c getting triggered, and it fetches a payload of data with googleID, showing that the user is logged in.


## Refactoring to async/await
- At present a.c is making use of promise which is returned from axios.get()
- Anytime we make req it returns promise, so we chain the code by .then

- If in arrow statements, returns return a single expression, remove the curly brace and return keyword.

```
export const fetchUser = () => async dispatch => {
  const res = await axios.get("/api/current_user");
  
  dispatch({ type: FETCH_USER, payload: res });
};
```

- Async / await is syntactic sugar to help you write normal linear declaration code in asynchronous actions. This takes away the necessary handling of returned promises which will break your code if you try to assign their "expected" value to a variable in your functional declaration. You can use try/catch for error handling.



## AuthReducer returns values
- Till now successfully actions are getting dispatched to the endpoint inside a.c.

3 diff situations for authReducer =>
- Now when you make the req to backend to get current user -> authReducer returns null -> null indicates that we dont know what's up right now
- Req complete, user is logged in -> authReducer returns user model -> obj containing user ID
- Req done, user is NOT logged in -> authReducer returns false -> False means, user is not logged in

    - For 1st case, instead of setting state={}, initialize state as null in reducer
    `export default (state = {}, action) => ...`

    - In js, empty tring is considered false value

```
export default (state = null, action) => {
  switch (action.type) {
    case FETCH_USER:
      return action.payload || false; //if user is not auth'd return false
    default:
      return state;
  }
};
```



## Accessing state in the header

- Hookup header comp to redux store and pull out auth piece of state.
- call mapStateToProps to call the entire state obj from redux store and pass it to header component as props.

```
//used es6 destructuring

function mapStateToProps({ auth }) { //can be replaced by func ...(state) {return auth: state.auth}
  return { auth };
}

export default connect(mapStateToProps)(Header);
```



## Header content
- Created a renderContent() method and made the switch cases for null, login and logout


