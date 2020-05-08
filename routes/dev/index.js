// Routes for dev
const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const fs = require('fs');
const mysql_query = require('../../app/mysql_query');
const msg = require('../../app/config/msg.json');

const path = require('path');

router.get('/migrations/:name', (req, res) => {
	const name = req.params.name;
	const migrations = ['create_users', 'drop_users'];
	if(migrations.indexOf(name) != -1){
		const sql = fs.readFileSync(path.resolve(__dirname, `./migrations/${name}.sql`)).toString();
		mysql_query(sql, (response) => {
			if(response.code == 200){
				res.send({code: 200, migration: name, msg: msg.MIGRATION_IS_OK});
			}else{
				res.send({code: 400, migration: name, msg: response.body });
			}
		});
	}else{
		res.send({code: 400, migration: name, msg: msg.MIGRATION_404});
	}
});

router.get('/table/:name', (req, res) => {
	mysql_query(`SELECT * FROM ${req.params.name}`, (response) => {
		res.send(response);
	});
});

router.get('/register/:login/:password', (req, res) => {
	const login = req.params.login;
	mysql_query(`SELECT user_ID FROM users WHERE login = '${login}'`, (response) => {
		if(response.body[0] === undefined){
			const pw = bcrypt.hashSync(req.params.password, 10);
			mysql_query(`INSERT INTO users (login, password, email) VALUES ('${login}', '${pw}', 'email')`, (response) => {
				res.send({code:200, login: login, msg: msg.REGISTER_SUCCESS});
			});
		}else{
			res.send({code:400, login: login, msg: msg.LOGIN_EXISTS});
		}
	})
});

router.get('/create_admin', (req, res) => {
	res.redirect('/register/admin/admin');	
});

module.exports = router;