const mongoose = require('mongoose');

const db = mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URI}/room-gen?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(conn => {
// const db = mongoose.connect('mongodb+srv://root:good_grades123@good-grades-ou0xu.mongodb.net/room-gen?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(conn => {
    if (conn)
        console.log('Connected to Database');
}).catch(error => {
    console.log('ERROR: ', error.message || error);
});

module.exports = {
    db
};