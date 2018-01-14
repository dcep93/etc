var data = require('./data');
var api = require('./api');

function get_children(children_args, err_callback, callback) {
	get_children_helper(children_args, err_callback, callback, []);
}

function get_children_helper(
	children_args,
	err_callback,
	callback,
	already_pulled_children
) {
	if (children_args.length === 0) {
		callback(already_pulled_children);
	}

	var child_obj = children_args[0];
	api.login(child_obj.code, err_callback, function(login_obj) {
		already_pulled_children.push({ user: login_obj, nsfw: child_obj.nsfw });
		get_children_helper(
			children_args.slice(1),
			callback,
			already_pulled_children
		);
	});
}

function register(args, callback) {
	// {
	// 	code: string
	// 	children: array[{
	//      code: string
	// 		nsfw: bool
	// 	}]
	// }

	api.login(args.code, callback, function(user) {
		get_children(args.children, callback, function(children) {
			data.init(user, children);
			callback(null);
		});
	});
}

module.exports = register;
