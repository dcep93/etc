chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs) {
	window.tab = tabs[0];
	var url = tab.url;
	var urlInput = document.getElementById('url');
	if (url.match(urlInput.pattern)) {
		urlInput.value = url;
	}
});

document.getElementById("form").onsubmit = function() {
	var url = document.getElementById('url').value;
	var match = url.match(document.getElementById('url').pattern);
	chrome.runtime.sendMessage({
		"url": url,
		"urlPrefix": match[1],
		"query": match[3],
		"regex": document.getElementById('regex').value,
		"ignoreCase": document.getElementById('ignore_case').checked,
		"rangeStart": parseInt(document.getElementById('range_start').value),
		"rangeEnd": parseInt(document.getElementById('range_end').value),
		"tabID": tab.id,
		"title": tab.title
	}, function(response) {
		if (response.received) {
			window.close();
		}
	});
	return false;
}
