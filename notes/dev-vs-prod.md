# Dev vs Prod environments 
_____________________________________________________________________

## Dev vs prod keys
- Deploying app to heroku again
- keys.js consists of all configuration api keys etc
- We should have 2 separate set of keys =>

> Dev
MongoDB, Google API, Cooie key

> Prod
MongoDB, Google API, Cooie key

2 reasons why we keep 2 keys => 
 - When we use production keys like this, we can store all the keys remotely on heroku servers. All developer keys can still remain on personal laptops.Now if you lose your laptop, you still have the keys on heroku servers. If someone find test db credientials, delete the db and start over again!

- Two sets of keys allows us to have 2 separate mongo databases.
Whenever we deploy app to production, we want to have clean db that has only our users data, which we dont manipulate. But in development environment we can add/delete records or add/delete collections without fear of breaking users production data.

> Where to keep keys in prod?
index.js -> config/keys.js -> are we doing dev/prod? -> 
prod -> use env variables
dev -> config/dev.js <- dont commit this

- we're going to have separate db, separate google api account and separate keys


## Generating production resources

New db for production
- Create a new database on mlab.com
- Create a service a/c that can access to db so that our copy of mongoose can login and make changes to db, so take the connection URI
- Add new database user


New google api a/c for prod
- new project
- enable api, enable google+ api 
- Generate credentials from left sidebar -> OAuth clientID
- consent screen -. product name
- App type - webapp
- Authorized javascript origins and authorized redirect uri's -> redirect to running heroku instance
- Command `heroku open` or `heroku info` to get the authorized redirect uri for prod -> `https://surveystark.herokuapp.com/auth/google/callback`
- Authorized JavaScript origins `https://surveystark.herokuapp.com`
- Now we have prod version of google api credentials


index.js -> config/keys.js -> commit this, so app knows what to do in dev or prod. It will now have actual set of keys -> are we doing dev or prod
prod -> env variables
dev -> config.js/dev.js -> dont commit this


- When you deploy your server to heroku there's an existing env. variable called node_env
- That env. variable tells whether or not we're running in a prod. environment
- Previously we have used one env. variable setup by heroku
`const PORT = process.env.PORT || 5000;`

- Inside config/keys.js
```
// keys.js - figure out what set of credentials to return

if (process.env.NODE_ENV === 'production') {
    // we're in production, return the prod set of keys
} else {
    // we're in development, return the dev keys
}
```


## Version control scheme
whenever prod.js containing keys for prod is required on heroku, values of each keys   are pulled from heroku environment variables. So for each key, we'll write `process.env...` which mean look for env variables

- prod.js is committed on github
Reason: when we push our project to heroku, we want the prod.js file, so essentially it gives all the keys from env variables assigned in prod.js


## Heroku env. variables
- Make sure all the env. variables are defined on the heroku server
- Do it inside heroku interface
- Go to heroku project -> settings -> config variables -> set up all the diff variables with pasting the key values there for all the diff env variables
- Now do the subsequent deployment by commiting and pushing the changes on heroku