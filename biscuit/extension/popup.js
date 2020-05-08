(function () {
	var div = document.getElementById("main");
	var link = document.getElementById("link");

	link.onclick = function () {
		this.setSelectionRange(0, this.value.length);
	};
	var tabId;

	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		tabId = tabs[0].id;
		scrape();
	});

	function scrape() {
		chrome.runtime.sendMessage({ method: "init", tabId: tabId }, function (
			initResponse
		) {
			if (initResponse.success) {
				getContentAndScrape();
			}
		});
	}

	function getContentAndScrape() {
		chrome.tabs.sendMessage(
			tabId,
			{ method: "getContent" },
			null,
			function (contentResponse) {
				if (contentResponse) {
					scrapeFromContent(contentResponse);
				} else {
					setTimeout(getContentAndScrape, 1000);
				}
			}
		);
	}

	function scrapeFromContent(contentResponse) {
		if (contentResponse.success) {
			var videoIds = new Set();

			var innerHTML = contentResponse.innerHTML;

			var match;
			var videoRegex = new RegExp(
				/(youtube\.com\/(watch\?v=|embed\/)|youtu.be(\/|%2F))([A-Za-z0-9\-_]+)(\.\.\.)?/g
			);
			while ((match = videoRegex.exec(innerHTML)) !== null) {
				if (match[5] !== undefined) continue;
				var videoId = match[4];
				videoIds.add(videoId);
			}

			if (videoIds.size == 0) {
				div.hidden = true;
				chrome.tabs.sendMessage(tabId, { method: "noVideos" });
			} else {
				div.hidden = false;
				link.value =
					"https://www.youtube.com/watch_videos?video_ids=" +
					Array.from(videoIds).join(",");
			}
		}
	}

	function clipboard() {
		link.select();
		document.execCommand("copy");
	}

	function log(message) {
		chrome.runtime.sendMessage({
			method: "log",
			message: message,
		});
	}

	function open() {
		window.open(link.value);
	}

	document.getElementById("clipboard").onclick = clipboard;
	document.getElementById("scrape").onclick = scrape;
	document.getElementById("open").onclick = open;
})();
