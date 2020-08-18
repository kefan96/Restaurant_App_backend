const mongoose = require('mongoose');
require('dotenv').config();

module.exports.User = require('./user');
module.exports.Reservation = require('./reservation');
