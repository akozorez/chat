// Routes for main
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql_query = require('../../app/mysql_query');
const msg = require('../../app/config/msg.json');
const router = express.Router();

// some middlewares
const middleware = {
	// log some data for req
	log: (req, res, next) => {

		const ext = [".css",".js",".jpg",".jpeg",".gif",".ico",".png",".bmp",".pict",".csv",".doc",
		".pdf",".pls",".ppt",".tif",".tiff",".eps",".ejs",".swf",".midi",".mid",".ttf",".eot",".woff",
		".woff2",".otf",".svg",".svgz",".webp",".docx",".xlsx",".xls",".pptx",".ps",".class",".jar", ".map"];

		if(ext.indexOf(path.extname(req.path))==-1){
			const some_data = {
				datetime: (new Date()).toLocaleString(),
				ip_addr: req.connection.remoteAddress,
				type: {
					method: req.method,
					path: req.path,
					log: null
				},
				agent: req.headers['user-agent']
			};
			console.log(some_data);
		}
  		next();
	},
	// if user has session on req
	isAuth: (req, res, next) => {
		if(!req.session.isAuth){
			return res.redirect('/');
		}else{
			next();
		}
	}
}
router.use(middleware.log);

router.get('/', (req, res) => {
	const bool = req.session.isAuth ? true : false;
	res.render('index', {
		title: 'Главная',
		isAuth: bool,
		login: req.session.login
	});
});

router.post('/login', (req, res) => {
	if(req.session.isAuth === true){
		res.send({code: 400, msg: msg.ALREADY_LOGINED});
	}else{
		mysql_query(`SELECT password, logined FROM users WHERE login = "${req.body.login}"`, (response) => {
			if(response.body[0] === undefined){
				res.send({code:400, msg: msg.INCORRECT_LOGIN});
			}else{
				if(bcrypt.compareSync(req.body.password, response.body[0].password)){
					const sql = `UPDATE users SET logined = TRUE WHERE login = "${req.body.login}"`;
					mysql_query(sql, (response) => {
						req.session.isAuth = true;
						req.session.login = req.body.login;
						res.send({code:200, msg: msg.AUTH_200, login: req.session.login});
					});
				}else{
					res.send({code:400, msg: msg.WRONG_PASSWORD});
				}
			}
		});
	}
});

router.get('/logout', (req, res) => {
	if(req.session.isAuth === true){
		const sql = `UPDATE users SET logined = FALSE WHERE login = "${req.session.login}"`;
		mysql_query(sql, (response) => {
			req.session.destroy();
			res.redirect('/');	
		});
	}
});

router.get('/chat/:name', middleware.isAuth, (req, res) => {
	const avail = ["anime", "dota"];
	const name = req.params.name;
	if(avail.indexOf(name)==-1){
		res.redirect('/404');
	}else{
		res.render('chat', {
			title: `Chat - Room(${name})`,
			login: req.session.login,
			name: name
		});
	}
});

router.get('/check', (req, res) => {
	if(req.session.isAuth){
		res.send({ code: 200, login: req.session.login });
	}else{
		res.send({ code: 400, login: null });
	}
});

// chat API


module.exports = router;