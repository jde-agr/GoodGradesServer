const server = require('./index').server;
const io = require('socket.io')(server);

io.sockets.on("connection", () => {
    console.log("Server-Client Connected!")
})