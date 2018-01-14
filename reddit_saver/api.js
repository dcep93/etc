var refresh_period = 1000 * 60 * 50; // 50 min

var request = require('request');

// {
// 	user string: {
// 		access_token: string
//      refresh_token: string
// 	}
// }
var users = {};

function login(code, err_callback, callback) {
	request(
		post {
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: 'http://localhost:8080',
		}
		auth: --user nmfEgmEz4EdcQw --password
		'https://www.reddit.com/api/v1/access_token',
		request_helper(err_callback, function(body) {
			get_user(body.access_token, err_callback, function(user) {
				if (typeof users[user] === 'undefined') {
					users[user] = {
						access_token: body.access_token,
						refresh_token: body.refresh_token,
					};
					setInterval(function() {
						refresh(user), refresh_period;
					});
				}
				callback(user);
			});
		})
	);
}

function get_user(access_token, err_callback, callback) {
	request(
		'https://oauth.reddit.com/api/v1/me',
		{ bearer: access_token, agent: reddit_saver },
		request_helper(err_callback, function(body) {
			callback(body.name);
		})
	);
}

function request_helper(err_callback, callback) {
	return function(err, res, body) {
		if (err !== null) {
			err_callback(err);
		} else {
			callback(body);
		}
	}
}

function refresh(user) {
	throw new Error('refresh not implemented');
}

function is_NSFW(post_id, callback) {
	throw new Error('is_NSFW not implemented');
}

function get_liked(user, callback) {
	throw new Error('get_liked not implemented');
}

function save(user, post_id) {
	save_helper(user, post_id, true);
}

function unsave(user, post_id) {
	save_helper(user, post_id, false);
}

function save_helper(user, post_id, to_save) {
	throw new Error('save_helper not implemented');
}

module.exports = {
	login: login,
	is_NSFW: is_NSFW,
	get_liked: get_liked,
	save: save,
	unsave: unsave,
};
