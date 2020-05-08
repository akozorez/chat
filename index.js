const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const config = require('./app/config');

const app = express();
const port = process.env.PORT || 3000;

let sessionMiddleware = session(config.session);

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(sessionMiddleware);

// Routing
let routes = [ "handlers", "main" ];
if(config.dev){
	routes.push("dev");
}
for (var i = routes.length - 1; i >= 0; i--) {
	const thisRoute = require(`./routes/${routes[i]}`);
	app.use(thisRoute);
}

// server

const server = app.listen(port, () => {
	const now = (new Date()).toLocaleString();
	console.log(`[${now}] app listen on *::${port}`);

	const sql = `UPDATE users SET logined = FALSE WHERE logined = TRUE`;
	require('./app/mysql_query')(sql, (resp) => {
		if(resp.code !== 200){
			console.log('Something wrong with reseting users logined state');
		}else{
			console.log('Users logined state successfull reseted');
		}
	});
});

// socket
const socket = require('./app/socket');
socket.init(server, sessionMiddleware);