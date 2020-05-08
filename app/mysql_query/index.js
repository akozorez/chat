const mysql = require('mysql');
const config = require('../config');

const mysql_query = (sql, cb) => {
	const db = mysql.createConnection(config.mysql);
	db.query(sql, (err, res) => {
		if(err){
			cb({ code: 400, body: err });
		}else{
			cb({ code: 200, body: res });
		}
	});
	db.end();
}

module.exports = mysql_query;