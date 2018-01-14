var data = require('./data');
var api = require('./api');

function get_children(children_args) {
	var children = [];
	for (var child of children_args) {
		response = api.login(child.code);
		if (response.err !== null) {
			return response;
		}
		children.push({ user: response.user, nsfw: child.nsfw });
	}
	return { children: children };
}

function register(args) {
	// {
	// 	code: string
	// 	children: array[{
	//      code: string
	// 		nsfw: bool
	// 	}]
	// }

	var response = api.login(args.code);
	if (response.err !== null) {
		return response.err;
	}
	var user = response.user;

	var children_obj = get_children(args.children);
	if (children_obj.err !== null) {
		return children_obj.err;
	}

	data.init(user, children);

	return null;
}

module.exports = register;
