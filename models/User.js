const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    unique_id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);