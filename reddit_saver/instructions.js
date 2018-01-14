// https://www.reddit.com/api/v1/authorize?client_id=nmfEgmEz4EdcQw&response_type=code&duration=permanent&state=_&redirect_uri=http://localhost:8080&scope=identity%20save%20history
// curl -X POST -d 'grant_type=authorization_code&code=sTyiscr1fsY4AiohWtpjObAr5E4&redirect_uri=http://localhost:8080' --user 'nmfEgmEz4EdcQw:' https://www.reddit.com/api/v1/access_token
// curl -H "Authorization: bearer l1QYkUaCl84qeDS3G7tvAwbKc68" -A 'reddit_saver' https://oauth.reddit.com/api/v1/me

module.exports = function(host) {
	throw new Error('instructions not implemented');
};
