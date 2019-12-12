const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const db = require('./db').db;
const cors = require('cors');

const Room = require('./models/Room');

const { schema } = require('./schema/index');

app.use(bodyParser.json());

var whitelist = ['http://localhost:5000']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions));

app.use('/graphql', bodyParser.json(), graphqlHttp({
    schema: schema,
    context: {
        Room
    },
    graphiql: true
}));

port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
})

app.get('/', (req, res, next) => {
    res.sendFile('views/index.html', { root: '.' });
});

const roomRoute = require('./api/room.js')
app.use('/api', roomRoute)