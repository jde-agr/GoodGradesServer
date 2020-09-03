const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socketManager = require('./sockets/socketManager');

require('dotenv').config();

const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const cors = require('cors');

const { db, Room, User, Event, QuickHelp, schema } = require("./db");

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
    context: (process.env.IS_SQL === "true") ? {
        pgPool : db
    } : {
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

const apiRoutes = (process.env.IS_SQL === "true") ? require('./api_sql/index') :  require('./api/index')
app.use('/api', apiRoutes.room, apiRoutes.user, apiRoutes.event, apiRoutes.quickHelp)
