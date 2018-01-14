// https://www.reddit.com/api/v1/authorize?client_id=nmfEgmEz4EdcQw&response_type=code&duration=permanent&state=_&redirect_uri=http://localhost:8080&scope=identity%20save%20history
// curl -X POST -d 'grant_type=authorization_code&code=sTyiscr1fsY4AiohWtpjObAr5E4&redirect_uri=http://localhost:8080' --user 'nmfEgmEz4EdcQw:' https://www.reddit.com/api/v1/access_token
// curl -H "Authorization: bearer b5CeFPXaY_UTQ0MWaCbMkGh0PJs" -A 'reddit_saver' https://oauth.reddit.com/api/v1/me

module.exports = function(host) {
	return 'curl -X POST -H "Content-Type: application/json" -d "{\\"code\\": \\"$CODE\\"}" localhost:3000';
};
