var data = require('./data');
var api = require('./api');

function login(access_token, refresh_token) {
	var response = api.login(access_token, refresh_token);
	if (response.err !== null) {
		return response.err;
	}
	data.set(access_token, response.user);
	return null;
}

function handle(access_token, refresh_token, parent_access_token, nsfw) {
	if (!data.exists(access_token)) {
		var err = login(access_token, refresh_token);
		if (err !== null) {
			return err;
		}
	}

	if (parent_access_token !== null) {
		data.add_child(parent_access_token, access_token, nsfw);
	}
	return null;
}

function register(args) {
	// {
	// 	access_token: string
	// 	refresh_token: string
	// 	parallel: array[{
	// 		access_token: string
	// 		refresh_token: string
	// 		nsfw: bool
	// 	}]
	// }

	var err = handle(args.access_token, args.refresh_token);

	if (err !== null) {
		return err;
	}

	for (var parallel of args.parallel) {
		err = handle(
			parallel.access_token,
			parallel.refresh_token,
			args.access_token,
			parallel.nsfw
		);

		if (err !== null) {
			return err;
		}
	}

	return null;
}

module.exports = register;
