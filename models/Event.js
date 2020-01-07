const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    tutor: {
        type: String,
        required: true
    },
    students: [{
        type: String
    }],
    start_time: { // stored as ISO String
        type : String,
        required: true
    },
    end_time: { // stored as ISO String
        type: String,
        required: true
    },
    booked: {
        type: Boolean,
        required: true
    }
});

EventSchema.index({ tutor: 1, start_time: 1 }, { unique: true, name: "combo" });
module.exports = mongoose.model('Event', EventSchema);