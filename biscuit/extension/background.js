(function () {
	chrome.runtime.onMessage.addListener(function (
		request,
		sender,
		sendResponse
	) {
		switch (request.method) {
			case "init":
				chrome.tabs.executeScript(
					request.tabId,
					{ file: "script.js" },
					function () {
						sendResponse({
							success: true,
						});
					}
				);
				return true;
				break;
			case "log":
				console.log(request.message);
				break;
			default:
				console.log("default", request);
		}
	});
})();
