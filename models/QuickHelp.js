const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuickHelpSchema = new Schema({
    student_id: {
        type: String,
        required: true,
        unique: true
    },
    tutor_id: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true
    }
});

QuickHelpSchema.index({ createdAt : 1 }, { expireAfterSeconds: 900 }); // expire after 15 min
module.exports = mongoose.model('QuickHelp', QuickHelpSchema);