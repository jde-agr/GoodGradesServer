const express = require('express')
const cors = require('cors')
const app = express();
require('dotenv').config();
const db = require('./db').db

app.use(cors())

port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
})

app.get('/', (req, res, next) => {
    res.sendFile('views/index.html', { root: '.' });
});

const roomRoute = require('./api/room.js')
app.use('/api', roomRoute)