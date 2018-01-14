// {
// 	user string: {
// 		access_token: string
//      refresh_token: string
// 	}
// }
var users = {};

function login(code) {
	throw new Error('login not implemented');
}

function is_NSFW(post_id) {
	throw new Error('is_NSFW not implemented');
}

function get_liked(user) {
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
