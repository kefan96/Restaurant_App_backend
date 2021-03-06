### Updated: simple cache added to improve get_business performance

# Restaurant App Backend

> An exercise for STIT backend team, created by Kefan Yang, using Node.js + MongoDB

A live demo is hosted on heroku [https://mighty-woodland-96308.herokuapp.com/](https://mighty-woodland-96308.herokuapp.com/), if you have any problems, feel free to contact me at ky1323@nyu.edu.

## Notable APIs/packages used: 
- **Yelp-fusion API** for restaurant information retrieving 
- **Mongoose** for MongoDB operations
- **Passport.js & Passport-local-mongoose** for user authentication

## Development Guide

### Installation

#### Clone

- Clone this repo to your local machine using `git clone https://github.com/kefan96/Restaurant_App_backend.git`

#### Setup

> install the dependencies first

```shell
cd Restaurant_App_backend
npm install
```

> install nodemon for better experience

```shell
npm instal -g nodemon
```

> you will need to create your own `.env` file with your API credentials

```
YELP_API_KEY = [YOUR YELP API KEY]
MONGO_DB_URI = [YOUR URL FOR MONGODB CONNECTION]
```
_A detail guide of using mongoDB can be found at the end of the Readme_

### Run
> ready to go!
```shell
node app.js
```
or
```shell
nodemon
```

> the app will be running at `localhost:3000` without further configuration

## User Guide

- Use postman or other tools you like to test the APIs

- All the APIs are listed below

- You can always use `/users` and `/reservations` to retrive the records of the two table

## List of APIs

### POST /register

> allows user to sign up for an account

```json
// require "email" and "password" as input
// example req.body:
{
    "email": "email@example.com",
    "password": "123456"
}

// successful response:
200
{
    "email": "email@example.com",
    "message": "registration successful"
}
```

### POST /login

> allows user to log in

```json
// require "email" and "password" as input
// example req.body:
{
    "email": "email@example.com",
    "password": "123456"
}

// successful response:
200
{
    "email": "email@example.com",
    "message": "login successful"
}
```

### POST /logout

> allows user to logout

```json
// no req.body required
// successful response:
200
{
    "message": "logout successful"
}
```

### GET /get_business

> lists restaurants nearby, logged in required

- expecting parameters: longitude, latitude
- if no location procided, use `'NYC'` as default location
- example request: `/get_business?longitude=-75&latitude=40`

### POST /setFavourite

> allows user to set a restaurant as favourite, looged in required

```json
// require restaurant_id as input
// example req.body:
{
    "restaurant_id": "_UOg5_pk9IhKee91eWrT4A"
}

//successful response
200
{
    "message": "Set favourite sucessful"
} 
```

### POST /unsetFavourite

> allows user to unset a restaurant from favourite, looged in required

```json
// require restaurant_id as input
// example req.body:
{
    "restaurant_id": "_UOg5_pk9IhKee91eWrT4A"
}

// successful response:
200
{
    "message": "Unset favourite successful"
}
```

### POST /reserve

> allows user to make an reservation to a restaurant

```json
// require restaurant_id as an input
// example req.body:
{
    "restaurant_id": "_UOg5_pk9IhKee91eWrT4A"
}

// sucessful response:
200
{
    "message": "Reservation successful"
}
```

> The rest of APIs are for testing, seeing records in db

### GET /users
> list all the users

### GET /reservations
> list all the reservations

## Database design

> The database is implemented using MmongoDB, non-SQL. There are two tables, User, and Reservation

### User table
```javascript
{
    email: String,
    password: String,
    favourite_ids: [{
        type: String
    }],
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation' // connects to Reservation table
    }]
}
```

### Reservation table
```javascript
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // connects to User table
    },
    status: String,
    business_id: String
}
```

## Connecting MongoDB
> To create your mongoDB cluster and connect to the database, you can refer to [the tutorial](https://docs.atlas.mongodb.com/getting-started/)

Once you have created the cluster or you have already have one, you can easily copy your connection uri into .env 
<img src="/public/example_mongo_uri.png" alt="mongoURI">

If you still have trouble connecting, please email kfy1323@nyu.edu and I will share my URI with you, or you can simply test with the [live version](https://mighty-woodland-96308.herokuapp.com/). But having your cluster is highly recommended, it is free and you will be able to see the tables. 
