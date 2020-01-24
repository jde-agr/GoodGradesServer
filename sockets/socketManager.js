var socketIO = require('../index.js');
const {NOTIFICATION, VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, LOGOUT, COMMUNITY_CHAT, MESSAGE_RECEIVED, MESSAGE_SENT, TYPING, PRIVATE_MESSAGE} = require('./socketEvents')

let connectedUsers = {}

module.exports = function(socket){
    // console.log(socket)
	socket.on(VERIFY_USER, (id, name, callback)=>{
		if (isUser(connectedUsers, name)){
			callback({isUser: true, user:null});
		}
		else{
			console.log("Creating a user " + name)
			callback({isUser: false, user:createUser({id: id, name: name, socketId:socket.id})})
		}
	})

	socket.on(USER_CONNECTED, (user)=>{
		console.log('This user has connected: ')
		console.log(user);
		user.socketId = socket.id;
		connectedUsers = addUser(connectedUsers, user)
		socket.user = user


		// socketIO.io.emit(USER_CONNECTED, connectedUsers)
		console.log("Connected Users: " + JSON.stringify(connectedUsers));
	})

	socket.on('disconnect', ()=>{
		if("user" in socket){
			console.log("Socket user:")
			console.log(socket.user)
			connectedUsers = removeUser(connectedUsers, socket.user.name)

			socketIO.io.emit(USER_DISCONNECTED, connectedUsers)
			console.log("Disconnect", connectedUsers);
		}
	})

	//User logsout
	socket.on(LOGOUT, ()=>{
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		socketIO.io.emit(USER_DISCONNECTED, connectedUsers)
		console.log("Disconnect", connectedUsers);
	})

	socket.on(NOTIFICATION, (message, receiver)=>{
		console.log(receiver)
		console.log('Notification received and sending it to', receiver.user_name)
		if (isUser(connectedUsers, receiver.user_name) ){
			console.log("USER IS CONNECTED");
			const receiverSocket = connectedUsers[receiver.user_name].socketId
			socket.to(receiverSocket).emit(NOTIFICATION, message)
		}
	})
}

function addUser(userList, user){
	// console.log("Add user: ", user)
	let newList = Object. assign({}, userList)
	if (user)
		newList[user.name] = user
	return newList
}

function removeUser(userList, username){
	let newList = Object.assign({}, userList)
	delete newList[username]
	return newList
}

function isUser(userList, username){
	return username in userList
}
