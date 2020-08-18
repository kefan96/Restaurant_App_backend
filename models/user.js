const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    favourite_ids: [{
        type: String
    }],
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
})

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
module.exports = mongoose.model('User', UserSchema);