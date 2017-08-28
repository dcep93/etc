(function() {
var tabs = new Set();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.method) {
		case "init":
			if (!tabs.has(request.tabId)) {
				tabs.add(request.tabId);
				chrome.tabs.executeScript(request.tabId, {file: 'script.js'}, function() {
					sendResponse({
						success: true
					});
				});
			} else {
				sendResponse({
					success: true
				});
			}
			return true;
			break;
		case "log":
			console.log(request.message);
			break;
		default:
			console.log('default', request);
	}
});
})();
