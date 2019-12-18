const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    room_url: {
        type: String,
        required: true
    },
    room_code: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Room', RoomSchema);