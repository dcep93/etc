(function() {
	var linkElement = document.getElementById('link');
	var videoRegex = new RegExp(/youtube\.com/watch\?v=[A-Za-z]+/);
	var tabId;

	chrome.tabs.getCurrent(function (tab) {
		tabId = tab.id;
	})

	function scrape() {
		console.log('scrape');
		
		var links = get();

		chrome.tabs.sendMessage(tabId, {method: "getContent"}, function(response) {
			if (response.success) {
				var newLinks = new Set();

				var innerHTML = response.innerHTML;

				var link;
				while((link = videoRegex.exec(innerHTML)) !== null) {
					if (!links.contains(link)) {
						links.add(link);
						newLinks.add(link);
					}
				}

				set(links);
				if (newLinks.size == 0) {
					alert('No new videos detected!');
				} else {
					linkElement.value = "https://www.youtube.com/watch_videos?video_ids=" + newLinks.join(",");
				}
			}
		});
	}

	function reset() {
		set(new Set());
		linkElement.value = "";
	}

	function clipboard() { // todo
		console.log('clipboard', linkElement.value);
	}

	function set(links) { // todo

	}

	function get() { // todo
		return new Set();
	}

	document.getElementById('reset').onclick = reset;
	document.getElementById('scrape').onclick = scrape;
	document.getElementById('clipboard').onclick = clipboard;

	scrape();
})();
