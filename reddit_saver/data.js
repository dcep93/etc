var execute_period = 1000 * 60 * 30; // 30 min

var api = require('./api');

// {
// 	access_token string: {
// 		user: user,
// 		saved: set[post_id int]
// 		children: array[
// 			{
// 				access_token: child_access_token string,
// 				nsfw: nsfw bool
// 			}
// 		]
// 	}
// }
var data = {};

function execute() {
	for (var access_token in data) {
		var o = data[access_token];
		var liked = api.get_liked(o.user);
		save(o.user, o.saved, liked, true);
		var children = o.children;
		o.children.forEach(function(child) {
			var c = data[child.access_token];
			save(c.user, c.saved, liked, child.nsfw);
		});
	}
}

function save(user, saved, liked, nsfw) {
	liked.forEach(function(post_id) {
		if (!saved.has(post_id)) {
			if (nsfw || !api.is_NSFW(post_id)) {
				api.save(user, post_id);
				saved.add(post_id);
			}
		}
	});
	unsave(user, saved, liked);
}

function unsave(user, saved, liked) {
	saved.forEach(function(post_id) {
		if (!liked.has(post_id)) {
			api.unsave(user, post_id);
		}
		saved.delete(post_id);
	});
}

setInterval(execute, execute_period);

function exists(access_token) {
	return typeof data[access_token] !== 'undefined';
}

function set(access_token, user) {
	data[access_token] = {
		user: user,
		saved: new Set([]),
		children: [],
	};
}

function add_child(parent_access_token, access_token, nsfw) {
	data[parent_access_token].children.push({
		access_token: access_token,
		nsfw: nsfw,
	});
}

module.exports = {
	exists: exists,
	set: set,
	add_child: add_child,
};
