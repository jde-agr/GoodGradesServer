const express = require('express')
const app = express();

port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
})

app.get('/', (req, res, next) => {
    res.sendFile('views/index.html', { root: '.' });
});

const roomRoute = require('./api/room.js')
app.use('/api', roomRoute)