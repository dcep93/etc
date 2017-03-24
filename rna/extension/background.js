chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	sendResponse({"received": true});
	console.log(request);
	var range = [request.rangeStart, request.rangeEnd];
	var regex = request.regex;
	var ignoreCase = request.ignoreCase;
	var tabID = request.tabID;
	var url = request.url;
	var urlPrefix = request.urlPrefix;
	var query = request.query;
	var title = request.title;
	main(range, regex, ignoreCase, tabID, url, urlPrefix, query, title);
});

function main(range, regex, ignoreCase, tabID, url, urlPrefix, query, title) {
	startProcessing(tabID);
	var allData = {
		"bottomURLQuery": undefined,
		"keys": ["Gene", "Location", "Gene type"],
		"windowSize": 1000000,
		"queue": 1,
		"data": [],
		"tabID": tabID,
		"baseURL": url,
		"urlPrefix": urlPrefix,
		"title": title,
		"timeout": undefined,
		"regexp": new RegExp(regex, ignoreCase ? "i" : undefined),
		"range": range
	};
	window.ad = allData;
	allData.bottomURLQuery = setBottomURLQuery(query);
	for (var i=range[0];i<range[1];i+=allData.windowSize) {
		collectData(i, range[1], allData);
	}
	tryToSave(allData);
}

function setBottomURLQuery(query) {
	var params = query.split(';');
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

function collectData(start, end, allData) {
	end = Math.min(end, start + allData.windowSize);
	var url = allData.urlPrefix + "Component/Location/View/bottom?" + allData.bottomURLQuery + start + "-" + end;
	getResponse("collectData", url, allData, function(responseText) {
		var html = parseHTML(responseText);
		getFromScreen(html, allData);
	});
}

function parseHTML(string) {
	var html = document.createElement('html');
  	html.innerHTML = string;
  	return html;
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
	if (toSave(data, allData)) {
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

function toSave(data, allData) {
	var geneType = data["Gene type"];
	if (geneType === undefined) {
		return false;
	}
	if (geneType.match(allData.regexp) !== null) {
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
	}, 20000);
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
		console.log(allData.data);
		clearTimeout(allData.timeout);
		var csv = ["index"].concat(allData.keys).concat(enquote(allData.title)).join(",") + "\n";
		for (var index in allData.data) {
			allData.data[index].Location = parseHTML(allData.data[index].Location).getElementsByTagName("a")[0].innerHTML;
			csv += [index].concat(allData.keys.map(function(i) { return enquote(allData.data[index][i]); })).join(",") + "\n";
		}
		var blob = new Blob([csv]);
		var url = URL.createObjectURL(blob);
		var filename = encodeURIComponent(allData.baseURL) + "___" + allData.range + "___" + encodeURIComponent(allData.regexp) + ".csv";
		console.log(filename);
		chrome.downloads.download({"filename": filename, "saveAs": true, "url": url});
		finish(allData, true);
	}
}

function enquote(string) {
	return "\"" + string + "\""
}

function startProcessing(tabID) {
	chrome.browserAction.setBadgeText({"text": "...", "tabId": tabID});
}

function finish(allData, success) {
	if (success) {
		chrome.browserAction.setBadgeText({"text": allData.data.length.toString(), "tabId": allData.tabID});
	} else {
		chrome.browserAction.setBadgeText({"text": "!", "tabId": allData.tabID});
		alert('Something went wrong when processing ' + allData.title)
	}
}
