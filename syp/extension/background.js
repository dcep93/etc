(function() {
console.log('background');

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
				return true;
			}
			break;
		default:
			console.log(request);
	}
	
	sendResponse({
		success: true
	});
});
})();
