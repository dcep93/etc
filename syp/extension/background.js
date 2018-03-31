(function() {
console.log('background');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.method) {
		case "init":
			chrome.tabs.executeScript(request.tabId, {file: 'script.js'}, function() {
				sendResponse({
					success: true
				});
			});
			return true;
		default:
			console.log(request);
	}
	
	sendResponse({
		success: true
	});
});
})();
