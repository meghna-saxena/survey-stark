## Fetching list of surveys

GET /api/surveys => returns a list of surveys created by the current_user

- Create a route handler, inside which write a query that will reach out to surveys collection inside Mongodb, and pull out all the diff surveys that have been created by the current_user
- Remember that current_user is available on req object as `req.user`
- Inside survey model, we have created `_user` property which contains user Id
- Therefore fetch surveys for `_user == current_user.id`
- Reaching out to db is asynchronous so use async/await helpers

```
 app.get("/api/surveys", async (req, res) => {
    const surveys = await Survey.find({
      _user: req.user.id
    });
  });
```

> Note

For accessing this handler the user should be auth'd, since we want current_user.id, so pass the requireLogin middleware

```
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({_user: req.user.id})

    res.send(surveys);
});

```


> requireLogin.js


```
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({ error: "You must login!" });
  }

  next();
};
```


## Whitelisting model fields

- No need to fetch the big list of recipients inside each survey from the db
- So tell mongoose DON'T return recipient list in the response
- Research for query#select in mongoose docs, its also known as query "projection"

> Query#select

Means Query class, an an instance method called select.

```
query.select({ a: 1, b: 1 });
query.select({ c: 0, d: 0 });
```

Here, 1 means include the field and 0 means exclude the field. So 1 and 0 are shorthand representation of true/false


```
app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false
    });

    res.send(surveys);
  });
```


## Testing surveys endpoint

- Test on the browser console `axios.get('/api/surveys');`



## Wiring surveys up to redux
- Made action, action creator and hooked it to reducer for fetching surveys