chrome.browserAction.onClicked.addListener(function(tab) {
	main(tab.url);
});

// http://uswest.ensembl.org/Mus_musculus/Component/Location/View/bottom?db=core;g=ENSMUSG00000054000;t=ENSMUST00000066774;r=4:93000000-94000000
// http://uswest.ensembl.org/Mus_musculus/Component/Location/View/bottom?db=core;g=ENSMUSG00000054000;r=4:93334111-93335538;t=ENSMUST00000066774;time=1484804535393.393
// http://uswest.ensembl.org/Mus_musculus/ZMenu/Transcript/View?calling_sp=Mus_musculus;config=contigviewbottom;db=core;g=ENSMUSG00000054000;t=ENSMUST00000066774

function main(baseURL) {
	var allData = {
		"bottomURLQuery": "",
		"keys": ["Gene", "Location", "Gene type"],
		"range": [93000000, 95000000],
		"windowSize": 1000000,
		"nextWindowStart": undefined,
		"queue": 0,
		"blankScreen": undefined,
		"data": [],
		"baseURL": baseURL,
		"html": document.createElement('html')
	};
	setBottomURLQuery(allData);
	allData.nextWindowStart = allData.range[0];
	nextScreen(allData);
}

function setBottomURLQuery(allData) {
	var params = allData.baseURL.split('View?')[1].split(';');
	var chromosomeNumber;
	for (var param of params) {
		if (param.indexOf('r=') == 0) {
			chromosomeNumber = param.substring(2).split(':')[0];
		} else {
			allData.bottomURLQuery += param + ';';
		}
	}
	allData.bottomURLQuery += 'r=' + chromosomeNumber + ':'
}

function nextScreen(allData) {
	if (allData.nextWindowStart >= allData.range[1]) {
		save(allData);
	} else {
		setBackgroundScreenURL(allData);
	}
}

function setBackgroundScreenURL(allData) {
	var start = allData.nextWindowStart;
	var end = start + allData.windowSize;
	allData.nextWindowStart = end;
	var url = "http://uswest.ensembl.org/Mus_musculus/Component/Location/View/bottom?" + allData.bottomURLQuery + start + "-" + end;
	console.log(url);
	getResponse(url, function(responseText) {
	  	allData.html.innerHTML = responseText;
		getFromScreen(allData);
	});
}

function getFromScreen(allData) {
	window.dan = allData.html;
	var bottomJson = JSON.parse(allData.html.getElementsByClassName('json_imagemap')[0].innerHTML);
	allData.blankScreen = true;
	for (var item of bottomJson) {
		if (item[2]['href'] !== undefined) {
			getFromBottom(item[2]['href'], allData);
		}
	}
	if (allData.blankScreen) {
		nextScreen(allData);
	}
}

function getFromBottom(url, allData) {
	if (url.indexOf('calling_sp') !== -1) {
		allData.blankScreen = false;
		allData.queue++;
		getResponse("http://uswest.ensembl.org/" + url, function(json) {
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
	allData.queue--;
	if (allData.queue == 0) {
		nextScreen(allData); // runs on main screen
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

function save(allData) {
	for (var data of allData.data) {
		console.log(data);
	}
	alert("made it to the end!!!!");
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

function getResponse(url, callback) {
	var request = makeHttpObject();
	request.open("GET", url, true);
	request.send(null);
	request.onreadystatechange = function() {
	  if (request.readyState == 4)
	  	callback(request.responseText);
	};
}
