const session_key = 'session_key1';
const jwt_key = 'jwt_key1';
const cookie_name = 'cookie_name1';

const mysql_json = require('./mysql.json');

module.exports = {
	dev: true,
	session: {
		secret: session_key,
	    resave: true,
	    maxAge: 180*10000,
	    saveUninitialized: true,
	    cookie: {}
	},
	jwt_key: jwt_key,
	session_key: session_key,
	cookie_name: cookie_name,
	mysql: mysql_json
}