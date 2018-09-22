var execute_period = 1000 * 60 * 30; // 30 min

var api = require('./api');

// {
// 	user string: {
// 		saved: set[post_id string]
// 		children: array[
// 			{
// 				user: string,
// 				nsfw: bool
// 			}
// 		]
// 	}
// }
var data = {};

function execute() {
	console.log('execute');
	for (var user in data) {
		handle(user);
	}
}

function handle(user) {
	console.log('handle', user);
	var o = data[user];
	api.get_liked(user, function(liked) {
		save(user, o.saved, liked, true);
		o.children.forEach(function(child) {
			var c = data[child.user];
			save(child.user, c.saved, liked, child.nsfw);
		});
	});
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
			saved.delete(post_id);
		}
	});
}

setInterval(execute, execute_period);

function init(user, children) {
	console.log('init', user, children);
	data[user] = {
		saved: new Set([]),
		children: children,
	};
	children.forEach(function(child) {
		init(child.user, []);
	});
}

module.exports = {
	init: init,
};
