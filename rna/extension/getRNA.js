function main() { // runs on main screen
	var allData = {
		"bottomURLBase": undefined,
		"keys": ["Gene", "Location", "Gene Type"],
		"range": [93000000, 110000000],
		"windowSize": 1000000,
		"nextWindowStart": undefined,
		"queue": 0,
		"blankScreen": undefined,
		"data": [],
	};
	setBottomURLBase(allData);
	allData.nextWindowStart = allData.range[0];
	nextScreen(allData);
}

function setBottomURLBase(allData) {
	var baseURLParts = baseURL.split('?')
	allData.bottomURLBase = baseURLParts[0];
	var params = baseURLParts[1].split(';');
	var chromosomeNumber;
	for (var param of params) {
		if (param.indexOf('r=') == 0) {
			chromosomeNumber = param.substring(2).split(':')[0];
		} else {
			allData.bottomURLBase += param + ';';
		}
	}
	allData.bottomURLBase += 'r=' + chromosomeNumber + ':'
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
	url = allData.bottomURLBase + start + "-" + end;
	// todo
	getFromScreen(allData); // runs on background screen
}

function getFromScreen(allData) {
	var bottomJson = JSON.parse($('.json_imagemap').innerHTML);
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
		$.getJSON(url, function(json) {
			getFromJson(json["features"][0], allData);
		});
	}
}

function getFromJson(json, allData) {
	var data = {"caption": json["caption"]};
	loadData(json["entries"], allData.keys, data);
	if (toSave(data)) {
		allData.data.append(data);
	}
	allData.queue--;
	if (allData.queue == 0) {
		nextScreen(allData); // runs on main screen
	}
}

function toSave(data) {
	var geneType = data["Gene type"];
	if (geneType === undefined) {
		return false;
	}
	return geneType.indexOf("RNA") !== -1
}

function loadData(entries, keys, data) {
	for (var key of keys) {
		for (var entry in entries) {
			if (entry["key"] === key) {
				data[key] = entry["value"];
				continue;
			}
		}
	}
}

function save(allData) {
	// todo
	for (var data of allData.data) {
		console.log(data);
	}
}
