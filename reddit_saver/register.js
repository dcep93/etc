function login(access_token, refresh_token) {
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
	// 		blacklist_subreddits: array[string]
	// 	}]
	// }

	var err = login(args.access_token, args.refresh_token);

	if (err != null) {
		return err;
	}

	for (var parallel of args.parallel) {
		err = login(parallel.access_token, parallel.refresh_token);

		if (err != null) {
			return err;
		}
	}

	return 'not implemented yet' + ' ' + JSON.stringify(args) + '\n';
}

module.exports = register;
