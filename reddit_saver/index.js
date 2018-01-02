var express = require('express');
var bodyParser = require('body-parser');

var register = require('./register');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('https://' + req.get('host') + '\n');
});

app.post('/', function(req, res) {
	console.log('dan');
	var err = register(req.body);
	if (err == null) {
		res.sendStatus(200);
	} else {
		res.status(400).send(err);
	}
});

app.use(function(err, req, res, next) {
	console.error('err', err.stack);
	res.status(500).send(err + '\n');
});

app.use(function(req, res, next) {
	res.sendStatus(404);
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log('listening on port ' + port);
});
