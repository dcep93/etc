var refresh_period = 1000 * 60 * 50; // 50 min

var client_id = 'nmfEgmEz4EdcQw';

var request = require('request');

// {
// 	user string: {
// 		access_token: string
//      refresh_token: string
// 	}
// }
var users = {};

// {
// 	post_id string: nsfw bool
// }
var posts = {};

function login(code, err_callback, callback) {
	request(
		{
			method: 'POST',
			uri: 'https://www.reddit.com/api/v1/access_token',
			form: {
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: 'http://localhost:8080',
			},
			auth: { user: client_id },
		},
		request_helper(err_callback, function(body) {
			get_user(body.access_token, err_callback, function(user) {
				if (typeof users[user] === 'undefined') {
					users[user] = {
						access_token: body.access_token,
						refresh_token: body.refresh_token,
					};
					setInterval(function() {
						refresh(user);
					}, refresh_period);
				}
				callback(user);
			});
		})
	);
}

function get_user(access_token, err_callback, callback) {
	request(
		{
			uri: 'https://oauth.reddit.com/api/v1/me',
			headers: { 'User-Agent': 'reddit_saver' },
			auth: { bearer: access_token },
		},
		request_helper(null, function(body) {
			callback(body.name);
		})
	);
}

function request_helper(err_callback, callback) {
	if (!err_callback) err_callback = console.log;
	if (!callback) callback = function() {};
	return function(err, res, body_string) {
		if (err !== null) {
			err_callback(err);
		} else {
			var body = JSON.parse(body_string);
			if (typeof body.error !== 'undefined') {
				err_callback(new Error(body.error));
			} else {
				callback(body);
			}
		}
	};
}

function refresh(user) {
	request(
		{
			method: 'POST',
			uri: 'https://www.reddit.com/api/v1/access_token',
			auth: { user: client_id },

			form: {
				grant_type: 'refresh_token',
				refresh_token: users[user].refresh_token,
			},
		},
		request_helper(null, function(body) {
			users[user].access_token = body.access_token;
		})
	);
}

function is_NSFW(post_id) {
	return posts[post_id];
}

function get_liked(user, callback) {
	get_liked_helper(user, null, new Set(), callback);
}

function get_liked_helper(user, after, liked, callback) {
	request(
		{
			uri:
				'https://oauth.reddit.com/user/' +
				user +
				'/upvoted?after=' +
				after,
			headers: { 'User-Agent': 'reddit_saver' },
			auth: { bearer: users[user].access_token },
		},
		request_helper(null, function(body) {
			body.data.children.forEach(function(child) {
				var id = child.data.name;
				posts[id] = child.data.over_18;
				liked.add(id);
			});
			if (body.data.after) {
				get_liked_helper(user, body.data.after, liked, callback);
			} else {
				callback(liked);
			}
		})
	);
}

function save(user, post_id) {
	request(
		{
			method: 'POST',
			uri: 'https://oauth.reddit.com/api/save',
			headers: { 'User-Agent': 'reddit_saver' },
			auth: { bearer: users[user].access_token },

			form: {
				category: 'reddit_saver',
				id: post_id,
			},
		},
		request_helper()
	);
}

function unsave(user, post_id) {
	request(
		{
			method: 'POST',
			uri: 'https://oauth.reddit.com/api/unsave',
			headers: { 'User-Agent': 'reddit_saver' },
			auth: { bearer: users[user].access_token },

			form: {
				id: post_id,
			},
		},
		request_helper()
	);
}

module.exports = {
	login: login,
	is_NSFW: is_NSFW,
	get_liked: get_liked,
	save: save,
	unsave: unsave,
};
