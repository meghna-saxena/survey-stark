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

- we're going to have separate db, separate googleapi's and separate keys
