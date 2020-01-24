const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.sockets.on("connection", () => {
    console.log("Server-Client Connected!")
})

module.exports = {
    app,
    server
}