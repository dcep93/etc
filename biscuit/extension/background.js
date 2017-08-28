var links = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.method) {
		case "get":
			var tabLinks = links[request.tabId];
			if (tabLinks === undefined) {
				chrome.tabs.executeScript(request.tabId, {file: 'script.js'});
				tabLinks = [];
			}
			sendResponse({
				success: true,
				links: tabLinks
			});
			break;
		case "set":
			links[request.tabId] = request.links;
			break;
		case "reset":
			if (links[request.tabId] !== undefined) {
				links[request.tabId] = [];
			}
			break;
		case "log":
			console.log(request.message);
			break;
		default:
			console.log('default', request);
	}
});
