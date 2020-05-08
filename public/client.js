document.addEventListener('DOMContentLoaded', () => {
	var socket = io.connect('http://localhost:3000/');
	// client-side socket
	/**/
	socket.on('exit', () => {
		location.href = '/';
	});

	let username;
	let connected = false;
	let myColor = '#000';

	socket.on('connect', () => {
		fetch(`http://localhost:3000/check`)
		.then(res => res.json())
		.then(data => {
			if(data.code == 200){
				username = data.login;
				connected = true;
				socket.emit('add user', username);
				const fieldset = document.querySelector('fieldset');
				if(fieldset){
					fieldset.removeAttribute('disabled');
					const form = document.querySelector('form');
					form.onsubmit = function(e) {
				        e.preventDefault();
				        const input = document.querySelector('input');
				        if(input){
				        	if(input.value!=''){
				        		let msg = input.value;
				        		input.value = '';
				        		msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
				        		if(msg && connected){
									addChatMessage({ username: username, message: msg, color: myColor });
				        			socket.emit('new message', msg);
				        		}
				        	}
				        }
				    }
				}
			}else{
				throw err;
			}
		})
		.catch(err => {
			location.href = '/';
		})
	});

	const updateCounter = (data) => {
		const online_counter = document.querySelector('.online-counter');
		if(online_counter){
			online_counter.innerText = data.numUsers;
		}
	};

	const addChatMessage = (data) => {
		const messages = document.querySelector('.messages');
		if(messages){
			const li = document.createElement('li');
			li.innerHTML = `<b style="color:${data.color}">${data.username}:</b> ${data.message}`;
			messages.append(li);
		}
	}

	const userJoinedOrLeft = (data, JoinedOrLeft) => {
		const messages = document.querySelector('.messages');
		if(messages){
			const li = document.createElement('li');
			li.innerHTML = `<span style="color:lightgrey;font-weight:900;font-style:italic;">${data.username} ${JoinedOrLeft}`;
			messages.append(li);
		}
	}

	socket.on('login', (data) => {
		username = data.username;
		if(username){
			myColor = data.color;
			const welcome = document.querySelector('.welcome');
			if(welcome){
				welcome.innerText = `Welcome to chat, ${data.username}`;
				userJoinedOrLeft({username: username}, 'joined');
			}
			updateCounter(data);
		}
	});
	socket.on('new message', (data) => {
		addChatMessage(data);
	});
	socket.on('user joined', (data) => {
		userJoinedOrLeft(data, 'joined');
		updateCounter(data);
	});
	socket.on('user left', (data) => {
		userJoinedOrLeft(data, 'left');
		updateCounter(data);
	});
	socket.on('disconnect', () => {
		const error_block = document.querySelector('.error');
		if(error_block){
			error_block.setAttribute('style', 'display: flex');
			const error_text = document.querySelector('.error-text');
			error_text.innerHTML = 'You have been disconnected';
			error_block.innerHTML += '<p><a href="/chat/anime">Reconnect</a></p>';
		}
		username = undefined;
		const fieldset = document.querySelector('fieldset');
		if(fieldset){
			fieldset.setAttribute('disabled', 'disabled');
		}
		const online_counter = document.querySelector('.online-counter');
		if(online_counter){
			online_counter.classList.add('disconnected');
			online_counter.innerText = '';
		}
	});
	socket.on('reconnect', () => {
		console.log('you have been reconnected');
		if(username) {
			socket.emit('add user', username);
		}
	});
	socket.on('reconnect_error', () => {
		console.log('attempt to reconnect has failed');
	})

});