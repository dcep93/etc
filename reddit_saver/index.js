var express = require('express');
var bodyParser = require('body-parser');

var config = require('./config');
var instructions = require('./instructions');
var register = require('./register');
var keep_alive = require('./keep_alive');

var app = express();
app.use(bodyParser.json());

app.use('/', keep_alive);

app.get('/', function(req, res) {
	res.send(instructions(req.get('host')) + '\n');
});

app.post('/', function(req, res) {
	register(req.body, function(err) {
		if (err === null) {
			res.sendStatus(200);
		} else {
			res.status(400).send(err.message + '\n');
		}
	});
});

app.use(function(err, req, res, next) {
	console.error('err', err.stack);
	res.status(500).send(err + '\n');
});

app.use(function(req, res, next) {
	res.sendStatus(404);
});

app.listen(config.port, function() {
	console.log('listening on port ' + config.port);
});
