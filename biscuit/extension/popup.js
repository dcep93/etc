(function() {
	var link = document.getElementById('link');
	var tabId;

	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		tabId = tabs[0].id;
		scrape();
	});

	function scrape() {
		chrome.runtime.sendMessage({method: "init", tabId: tabId}, function(initResponse) {
			if (initResponse.success) {
				chrome.tabs.sendMessage(tabId, {method: "getContent"}, null, function(contentResponse) {
					if (contentResponse.success) {
						var videoIds = new Set();

						var innerHTML = contentResponse.innerHTML;

						var match;
						var videoRegex = new RegExp(/youtube\.com\/watch\?v=([A-Za-z0-9]+)/g);
						while((match = videoRegex.exec(innerHTML)) !== null) {
							var videoId = match[1];
							if (!videoIds.has(videoId)) {
								videoIds.add(videoId);
							}
						}

						if (videoIds.size == 0) {
							chrome.tabs.sendMessage(tabId, {method: "noVideos"});
						} else {
							link.value = "https://www.youtube.com/watch_videos?video_ids=" + Array.from(videoIds).join(",");
						}
					}
				});
			}
		});
	}

	function clipboard() { // todo
	}

	function log(message) {
		chrome.runtime.sendMessage({
			"method": "log",
			"message": message
		});
	}

	document.getElementById('scrape').onclick = scrape;
	document.getElementById('clipboard').onclick = clipboard;
})();
