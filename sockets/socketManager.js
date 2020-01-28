var socketIO = require('../index.js');
const {NOTIFICATION, VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, LOGOUT, RECEIVEQUICKHELP, QUICKHELPRESPONSE, RELOAD_DATA} = require('./socketEvents')

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
		console.log('User Connected:    ', user.givenName, user.unique_id);
		user.socketId = socket.id;
		connectedUsers = addUser(connectedUsers, user)
		socket.user = user
		socketIO.io.emit(USER_CONNECTED, connectedUsers)
		// console.log("Connected Users: " + JSON.stringify(connectedUsers));
	})

	socket.on('disconnect', ()=>{
		if("user" in socket){
			connectedUsers = removeUser(connectedUsers, socket.user.unique_id)
			socketIO.io.emit(USER_DISCONNECTED, connectedUsers)
			displayConnectedUsers()
		}
	})

	//User logsout
	socket.on(LOGOUT, ()=>{
		connectedUsers = removeUser(connectedUsers, socket.user.unique_id)
		socketIO.io.emit(USER_DISCONNECTED, connectedUsers)
		console.log("User Disconnected: ", socket.user.givenName, socket.user.unique_id);
		displayConnectedUsers();
	})

	socket.on(NOTIFICATION, (message, receiver)=>{
		console.log("NOTIFICATION CAUGHT")
		if (receiver === "tutor"){
			console.log("QUICKHELP BEING SENT TO ALL TUTORS")
			socketIO.io.emit(RECEIVEQUICKHELP, message);
		}
		// console.log('Notification received and sending it to', receiver.user_name)
		else if (isUser(connectedUsers, receiver.unique_id)){
			console.log("USER IS CONNECTED");
			const receiverSocket = connectedUsers[receiver.unique_id].socketId
			socket.to(receiverSocket).emit(QUICKHELPRESPONSE, message)
		}
	})

	socket.on(RELOAD_DATA, (message, receiver)=>{
		if (receiver === "student"){
			console.log(message);
			socketIO.io.emit(RELOAD_DATA, message);
		}
		if (receiver === "tutor"){
			console.log(message);
			socketIO.io.emit(RELOAD_DATA, message);
		}
		// console.log('Notification received and sending it to', receiver.user_name)
		// else if (isUser(connectedUsers, receiver.unique_id)){
		// 	console.log("USER IS CONNECTED");
		// 	const receiverSocket = connectedUsers[receiver.unique_id].socketId
		// 	socket.to(receiverSocket).emit(QUICKHELPRESPONSE, message)
		// }
	})
}

function addUser(userList, user){
	// console.log("Add user: ", user)
	let newList = Object. assign({}, userList)
	if (user)
		newList[user.unique_id] = user
	return newList
}

function removeUser(userList, unique_id){
	let newList = Object.assign({}, userList)
	delete newList[unique_id]
	return newList
}

function isUser(userList, unique_id){
	return unique_id in userList
}

function displayConnectedUsers(){
	if (Object.keys(connectedUsers).length > 0){
		console.log("Connected Users:");
		// for (let elm in connectedUsers) {
		// 	console.log("-", elm.user.givenName, elm.user.unique_id);
		// }
	}
	else{
		console.log("------No users are connected------")
	}
}
