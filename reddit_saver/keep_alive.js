var keep_alive_period = 1000 * 60 * 10; // 10 min

var express = require('express');
var request = require('request');

var config = require('./config');

var router = express.Router();

router.get('/keep_alive', function(req, res) {
	console.log('keep_alive');
	res.sendStatus(200);
});

function keep_alive() {
	request('http://127.0.0.1:' + config.port + '/keep_alive', function(
		err,
		res,
		body
	) {
		if (err !== null) {
			console.log(err);
		}
	});
}

setInterval(keep_alive, keep_alive_period);

module.exports = router;
