var log = console.log;
console.log = function() {
	var arr = Array.from(arguments);
	var d = new Date();
	var dateString = `${d.toDateString()} ${d.toTimeString().split(' ')[0]}`;
	arr.unshift(dateString);
	log(...arr);
};

var express = require('express');
var bodyParser = require('body-parser');

var config = require('./config');
var instructions = require('./instructions');
var register = require('./register');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
	console.log('get');
	res.send(instructions(req.get('host')) + '\n');
});

app.post('/', function(req, res) {
	console.log('post');
	register(req.body, function(err) {
		console.log('register return');
		if (err === null) {
			console.log('200');
			res.sendStatus(200);
		} else {
			console.log('400');
			res.status(400).send(err.message + '\n');
		}
	});
});

app.use(function(err, req, res, next) {
	console.error('err', err.stack);
	res.status(500).send(err + '\n');
});

app.use(function(req, res, next) {
	console.log('404');
	res.sendStatus(404);
});

app.listen(config.port, function() {
	console.log('listening on port ' + config.port);
});
