// express init
const express = require('express');
const app = express();

// packages
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const yelp = require('yelp-fusion');

// settings
app.use(cors());
app.use(bodyParser.json({extended: true}));

// .env setup
require('dotenv').config();

// statics
const PORT = process.env.PORT || 3000;
const YELP_API_KEY = process.env.YELP_API_KEY;

// mongodb connection
const mongoURI = process.env.MONGO_DB_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to DB!");
}).catch(err => {
    console.log("ERROR: ", err.message);
});

mongoose.Promise = Promise;

// models
const {
    User,
    Reservation
} = require('./models');

// passport.js setup
app.use(require("express-session")({
    secret: "Jake is the cutest dog in the wolrd",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// yelp client setup
const client = yelp.client(YELP_API_KEY);

app.get('/', (req, res) => {
    res.send("Hello World!");
});

// POST request for /register
// Will register an account for the user
// Expect email and password as inputs in req.body
app.post('/register', (req, res) => {
    User.register(new User({
        email: req.body.email
    }), req.body.password, (err, createdUser) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
        } else {
            res.status(200).json({
                email: createdUser.email,
                message: "registration successful"
            });
        }
    })
});

// POST request for /login
// Will log you in if you enter the right credentials
// Expect email and password as inputs in req.body
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        console.log(user, req.body)
        if (!user) {
            return res.send({
                success: false,
                message: 'authentication failed'
            });
        }
        // login user
        req.logIn(user, loginErr => {
            if (loginErr) {
                return next(loginErr);
            }
            return res.status(200).json({
                "email": user.email,
                "message": "login successful"
            });
        });
    }) (req, res, next);
});

// POST request for /logout
// Will log you out
app.post('/logout', (req, res) => {
    try {
        req.logout();
        res.status(200).json({
            "message": "logout successful"
        });
    } catch (err) {
        res.status(400).json({
            "error": err.message
        });
    }
});

// GET business api
// expecting parameters: longitude, latitude
// if no location procided, use NYC as default location
app.get('/get_business', isLoggedIn, (req, res) => {
    const {
        longitude,
        latitude
    } = req.query;
    const searchObject = (longitude && latitude) ? {
        longitude: longitude,
        latitude: latitude
    } : {
        location: 'NYC'
    };

    client.search(searchObject)
        .then(response => {
            res.status(200).json(JSON.parse(response.body));
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            });
        })
});

// POST request for /setFavourite
// Will insert the restaurant to the favourite_ids of the current user
// Expect the restaurant_id as an input in req.body
app.post('/setFavourite', isLoggedIn, (req, res, next) => {
    const {restaurant_id} = req.body;
    if (!restaurant_id) {
        return res.status(400).json({"error": "Missing restaurant ID"});
    }
    User.findById(req.user._id, (err, foundUser) => {
        if (err) return next(err);
        foundUser.favourite_ids.push(restaurant_id);
        foundUser.save()
        return res.status(200).json({"message": "Set favourite sucessful"});
    })
});

// POST request for /unsetFavourite
// Will delete the restaurant from the user's favourite_ids if the provided restaurant_id is in the user's favourite_ids
// Expect the restaurant_id as an input in req.body
app.post('/unsetFavourite', isLoggedIn, (req, res, next) => {
    const res_id = req.body.restaurant_id;
    if (!res_id) {
        return res.status(400).json({"error": "Missing restaurant ID"});
    }
    User.foundById(req.user._id, (err, foundUser) => {
        if (err) return next(err);
        foundUser.favourites_ids = foundUser.favourites_ids.filter({function(str) {
            return str !== res_id; 
        }});
        foundUser.save();
        return res.status(200).json({"message": "Unset favourite successful"});
    })
});

// POST request for /reserve
// Will create a new record in Reservation table container reference to user and restaurant id
// Will add the newly created record to user's reservations
// Expect restaurant_id as an input in req.body
app.post('/reserve', isLoggedIn, (req, res, next) => {
    const res_id = req.body.restaurant_id;
    const user_id = req.user._id;
    User.findById(user_id, (err, foundUser) => {
        if (err) return next(err);
        Reservation.create({
            user: user_id,
            business_id: res_id,
            status: "PENDING"
        }, (err, createdReservation) => {
            if (err) return next(err);
            foundUser.reservations.push(createdReservation);
            foundUser.save();
            res.status(200).json({"message": "Reservation successful"});
        });
    });
});
// ********************
// *routes for testing*
// ********************

// Retrieve all users' information from the database
app.get('/users', (req, res, next) => {
    User.find({})
        // With the below line of code, it will send you the detail information for every reservation, instead of id only
        // .populate('reservations')
        .exec((err, users) => {
            if (err) return next(err);
            return res.status(200).json({foundUsers: users});
        })
});

// Retrieve all reservations' information from the database
app.get('/reservations', (req, res, next) => {
    Reservation.find({})
        // With the below line of code, it will send you the detail information for user, instead of only id 
        // .populate('user')
        .exec((err, reservations) => {
            if (err) return next(err);
            return res.status(200).json({reservations: reservations});
        })
})

app.listen(PORT, function () {
    console.log('app listen on port ' + PORT);
});

// middleware: check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(400).json({
            "error": "Please login first"
        });
    }
}