(function() {
	var link = document.getElementById('link');
	var tabId;

	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		tabId = tabs[0].id;
	});

	function scrape() {
		get(function (links) {
			chrome.tabs.sendMessage(tabId, {method: "getContent"}, null, function(response) {
				if (response.success) {
					var videoIds = new Set();

					var innerHTML = response.innerHTML;

					var match;
					var videoRegex = new RegExp(/youtube\.com\/watch\?v=([A-Za-z0-9]+)/g);
					while((match = videoRegex.exec(innerHTML)) !== null) {
						var videoId = match[1];
						if (!links.has(videoId)) {
							links.add(videoId);
							videoIds.add(videoId);
						}
					}

					set(links);
					if (videoIds.size == 0) {
						chrome.tabs.sendMessage(tabId, {method: "noNewVideos"});
					} else {
						link.value = "https://www.youtube.com/watch_videos?video_ids=" + Array.from(videoIds).join(",");
					}
				}
			});
		});
	}

	function clipboard() { // todo
	}

	function reset() {
		chrome.runtime.sendMessage({
			"method": "reset",
			"tabId": tabId
		});
		link.value = "";
	}

	function set(links) {
		chrome.runtime.sendMessage({
			"method": "set",
			"tabId": tabId,
			"links": Array.from(links)
		});
	}

	function get(callback) {
		chrome.runtime.sendMessage({
			"method": "get",
			"tabId": tabId
		}, function (response) {
			if (response.success) {
				callback(new Set(response.links));
			}
		});
	}

	function log(message) {
		chrome.runtime.sendMessage({
			"method": "log",
			"message": message
		});
	}

	document.getElementById('reset').onclick = reset;
	document.getElementById('scrape').onclick = scrape;
	document.getElementById('clipboard').onclick = clipboard;

	scrape();
})();
