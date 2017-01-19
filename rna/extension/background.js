chrome.browserAction.onClicked.addListener(function(tab) {
	if (tab.url.indexOf("http://uswest.ensembl.org/Mus_musculus/Location/View?") == 0) {
		main(tab.url);
	}
});

function main(baseURL) {
	var allData = {
		"bottomURLQuery": undefined,
		"keys": ["Gene", "Location", "Gene type"],
		"range": [93000000, 110000000],
		"windowSize": 1000000,
		"queue": 1,
		"data": [],
		"baseURL": baseURL
	};
	allData.bottomURLQuery = setBottomURLQuery(allData);
	for (var i=allData.range[0];i<allData.range[1];i+=allData.windowSize) {
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
	getResponse(allData, url, function(responseText) {
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

function getFromBottom(url, allData) {
	if (url.indexOf('calling_sp') !== -1) {
		getResponse(allData, "http://uswest.ensembl.org/" + url, function(json) {
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
	return geneType.indexOf("RNA") !== -1
}

function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

function getResponse(allData, url, callback) {
	console.log(url);
	allData.queue++;
	var request = makeHttpObject();
	request.open("GET", url, true);
	request.send(null);
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
		for (var data of allData.data) {
			console.log(data);
		}
		alert("made it to the end!!!!");
	}
}
