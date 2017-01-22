chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs) {
	window.tab = tabs[0];
	var url = tab.url;
	var urlInput = document.getElementById('url');
	if (url.match(urlInput.pattern)) {
		urlInput.value = url;
	}
	document.getElementById('regex').value = "RNA"
	document.getElementById('range_start').value = 93000000
	document.getElementById('range_end').value = 94000000
});

document.getElementById("form").onsubmit = function() {
	chrome.runtime.sendMessage({
		"url": document.getElementById('url').value,
		"regex": document.getElementById('regex').value,
		"ignoreCase": document.getElementById('ignore_case').checked,
		"rangeStart": parseInt(document.getElementById('range_start').value),
		"rangeEnd": parseInt(document.getElementById('range_end').value),
		"tabID": tab.id,
		"url": tab.url,
		"title": tab.title
	}, function(response) {
		if (response.received) {
			window.close();
		}
	});
	return false;
}
