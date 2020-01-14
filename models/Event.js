const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    tutor: {
        type: String,
        required: true
    },
    students: [Object],
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
    },
    expireAt: {
        type: Date,
        required: true
    }
});

EventSchema.index({ tutor: 1, start_time: 1 }, { unique: true, name: "combo" });
EventSchema.index({ expireAt : 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Event', EventSchema);