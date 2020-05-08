function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
const socket_API = {
	init: (app, sessionMiddleware) => {
		const sio = require('socket.io')(app);
		sio.use(function(socket, next) {
		    sessionMiddleware(socket.request, socket.request.res || {}, next);
		});

		let numUsers = 0;
		let logins = [];
		let sockets = [];
		// server-side socket
		/**/

		sio.on('connection', (socket) => {
			const login = socket.request.session.login;
			socket.chatColor = getRandomColor();

			if(login == undefined){
				socket.emit('exit');
				return;
			}else{
				let addedUser = false;
				socket.on('add user', (login) => {
					if(logins[login]===undefined){
						if(addedUser) return;
						++numUsers;
						addedUser = true;
						logins[login] = true;
						sockets[login] = socket;
						
						socket.emit('login', {
							username: login,
							numUsers: numUsers,
							color: socket.chatColor
						});
						socket.broadcast.emit('user joined', {
							username: login,
							numUsers: numUsers,
							color: socket.chatColor
						});
					}else{
					 	sockets[login].disconnect();

						if(addedUser) return;
						++numUsers;
						addedUser = true;
						logins[login] = true;
						sockets[login] = socket;
						
						socket.emit('login', {
							username: login,
							numUsers: numUsers,
							color: socket.chatColor
						});
						socket.broadcast.emit('user joined', {
							username: login,
							numUsers: numUsers,
							color: socket.chatColor
						});
					}
				});

				socket.on('new message', (data) => {
					socket.broadcast.emit('new message', {
						username: login,
						message: data,
						color: socket.chatColor
					});
				});

				socket.on('disconnect', () => {
					if(addedUser){
						--numUsers;
						socket.broadcast.emit('user left', {
							username: login,
							numUsers: numUsers,
							color: socket.color
						});
					}
				});
			}
		});
	}
}
module.exports = socket_API;