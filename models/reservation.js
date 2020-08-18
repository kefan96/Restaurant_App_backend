const mongoose = require('mongoose');

const ReservationSchma = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: String,
    business_id: String
});

module.exports = mongoose.model('Reservation', ReservationSchma);