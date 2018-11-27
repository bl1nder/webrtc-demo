var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function (req, res) {
	console.log(req.url);

	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	file.serve(req, res);
})

let GLOBAL_OFFER = null;
let GLOBAL_ANSWER = null;

var allowedOrigins = "*";

var io = require('socket.io').listen(app);

app.listen(1234, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`server is listening on 1234`)
});
let userList = [];
var i = 0;
io.on('connection', function (socket) {

	console.log('a user connected', socket.id);
	userList.push(socket.id);
	io.sockets.emit('joined', { userList })

	socket.on('disconnect', function () {
		console.log('disconnect', socket.id)
		userList = userList.filter(x => x !== socket.id)
		console.log(userList)

	});
});


io.on('connection', function (socket) {

	function log() {
		var array = [">>> "];
		for (var i = 0; i < arguments.length; i++) {
			array.push(arguments[i]);
		}
		socket.emit('log', array);
	}

	socket.on('message', function (obj) {
		console.log(obj);
		let message = obj.message;
		let id = obj.to;
		if (id) {
			socket.broadcast.to(id).emit('message', message)
		} else {
			log('Got message socket: ', message);
			console.log('message socket - ', message);
			socket.broadcast.emit('message', message); // should be room only
			socket.broadcast.emit('messageback', message); // should be room only
		}

	});
	socket.on('messageback', function (message) {
		log('Got messageback: ', message);



		// socket.broadcast.emit('messageback', message); // should be room only

	});
	socket.on('offer', function (offer) {
		console.log('offer', offer)
		log('Got offer: ', offer);
		GLOBAL_OFFER = offer;
	});
	socket.on('accept', function (answer) {

		console.log('accept', socket.id, GLOBAL_OFFER)
		socket.emit('accept_back', GLOBAL_OFFER.sdpData)
	});


	socket.on('create or join', function (room) {
		let currentRoom = io.sockets.adapter.rooms[room] || [];
		var numClients = currentRoom.length || 0
		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0) {
			socket.join(room);
			console.log('joined to room');

			socket.emit('created', room);
		}

		else if (numClients !== 0) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined room', room);
		}

		// else { // max two clients
		// 	console.log('// max two clients')
		// 	socket.emit('full', room);
		// }

		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
	});
});