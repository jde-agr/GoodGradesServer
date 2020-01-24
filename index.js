const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socketManager = require('./socketManager');

require('dotenv').config();
const db = require('./db').db;
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const cors = require('cors');

const Room = require('./models/Room');
const User = require('./models/User');
const Event = require('./models/Event');
const QuickHelp = require('./models/QuickHelp');

const { schema } = require('./schema/index');

io.on('connection', socketManager);

module.exports.io = io;

app.use(bodyParser.json());

var whitelist = ['http://localhost:3000', 'http://localhost:5000', `${process.env.DOMAIN_URL}`, 'http://good-grades.herokuapp.com', 'https://good-grades.herokuapp.com', 'https://good-grades-dev.herokuapp.com']
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
        Room, User, Event, QuickHelp
    },
    graphiql: true
}));

port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log('Listening on port ' + port);
})

app.get('/', (req, res, next) => {
    res.sendFile('views/index.html', { root: '.' });
});

const apiRoutes = require('./api/index')
app.use('/api', apiRoutes.room, apiRoutes.user, apiRoutes.event, apiRoutes.quickHelp)

