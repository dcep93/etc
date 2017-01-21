chrome.browserAction.onClicked.addListener(function(tab) {
	if (tab.url.indexOf("http://uswest.ensembl.org/Mus_musculus/Location/View?") == 0) {
		var range = [93000000, 94000000];
		var regex = "RNA";
		var regexFlags = "";
		main(range, regex, regexFlags, tab);
	}
});

function main(range, regex, regexFlags, tab) {
	startProcessing(tab.id);
	var allData = {
		"bottomURLQuery": undefined,
		"keys": ["Gene", "Location", "Gene type"],
		"windowSize": 1000000,
		"queue": 1,
		"data": [],
		"tabID": tab.id,
		"baseURL": tab.url,
		"title": tab.title,
		"timeout": undefined
	};
	allData.bottomURLQuery = setBottomURLQuery(allData);
	for (var i=range[0];i<range[1];i+=allData.windowSize) {
		collectData(i, allData);
	}
	tryToSave(allData);
}

function setBottomURLQuery(allData) {
	var params = allData.baseURL.split('View?')[1].split(';');
	var chromosomeNumber;
	var urlQuery = "";
	for (var param of params) {
		if (param.indexOf('r=') == 0) {
			chromosomeNumber = param.substring(2).split(':')[0];
		} else {
			urlQuery += param + ';';
		}
	}
	urlQuery += 'r=' + chromosomeNumber + ':'
	return urlQuery;
}

function collectData(start, allData) {
	var end = start + allData.windowSize;
	var url = "http://uswest.ensembl.org/Mus_musculus/Component/Location/View/bottom?" + allData.bottomURLQuery + start + "-" + end;
	getResponse("collectData", url, allData, function(responseText) {
		var html = document.createElement('html');
	  	html.innerHTML = responseText;
		getFromScreen(html, allData);
	});
}

function getFromScreen(html, allData) {
	var bottomJson = JSON.parse(html.getElementsByClassName('json_imagemap')[0].innerHTML);
	for (var item of bottomJson) {
		if (item[2]['href'] !== undefined) {
			getFromBottom(item[2]['href'], allData);
		}
	}
}

function getFromBottom(path, allData) {
	if (path.indexOf('calling_sp') !== -1) {
		var url = "http://uswest.ensembl.org/" + path;
		getResponse("getFromBottom", url, allData, function(json) {
			getFromJson(JSON.parse(json)["features"][0], allData);
		});
	}
}

function getFromJson(json, allData) {
	var data = {"caption": json["caption"]};
	loadData(json["entries"], allData.keys, data);
	if (toSave(data)) {
		allData.data.push(data);
	}
}

function loadData(entries, keys, data) {
	for (var key of keys) {
		for (var entry of entries) {
			if (entry["key"] === key) {
				data[key] = entry["value"];
				continue;
			}
		}
	}
}

function toSave(data) {
	var geneType = data["Gene type"];
	if (geneType === undefined) {
		return false;
	}
	if (geneType.indexOf("RNA") === 1) {
		return true;
	}
	return false;
}

function getResponse(name, url, allData, callback) {
	console.log(name, url);
	allData.queue++;
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.send(null);
	clearTimeout(allData.timeout);
	allData.timeout = setTimeout(function() {
		finish(allData, false);
	}, 10000);
	startProcessing(allData.tabID);
	request.onreadystatechange = function() {
	  if (request.readyState == 4) {
	  	callback(request.responseText);
		tryToSave(allData);
	  }
	};
}

function tryToSave(allData) {
	allData.queue--;
	if (allData.queue == 0) {
		clearTimeout(allData.timeout);
		var csv = allData.keys.join(",") + "," + allData.title + ",\n";
		for (var data of allData.data) {
			csv += allData.keys.map(function(i) { return data[i]; }) + "\n";
		}
		var blob = new Blob([csv]);
		var url = URL.createObjectURL(blob);
		var filename = encodeURIComponent(allData.title) + ".csv";
		chrome.downloads.download({"filename": allData.title, "saveAs": true, "url": url});
		finish(allData, true);
	}
}

function startProcessing(tabID) {
	chrome.browserAction.setBadgeText({"text": "...", "tabId": tabID});
	if (!processingTabs.has(tabID)) {
		processingTabs.add(tabID);
	}
}

function finish(allData, success) {
	processingTabs.delete(allData.tabID);
	if (success) {
		chrome.browserAction.setBadgeText({"text": "\u2713", "tabId": allData.tabID});
	} else {
		chrome.browserAction.setBadgeText({"text": "!", "tabId": allData.tabID});
		alert('Something went wrong when processing ' + allData.title)
	}
}
