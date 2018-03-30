(function() {
	console.log('popup');

	var link = document.getElementById('link');
	var tabId;

	function main() {
		link.onclick = function() {
			this.setSelectionRange(0, this.value.length);
		};

		chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
			tabId = tabs[0].id;
			scrape();
		});	
	}

	function scrape() {
		chrome.runtime.sendMessage({ method: 'init', tabId: tabId }, function(
			initResponse
		) {
			if (initResponse && initResponse.success) {
				getContentAndScrape();
			} else {
				chrome.tabs.sendMessage(tabId, 'scrape');
			}
		});
	}

	function getContentAndScrape() {
		chrome.tabs.sendMessage(tabId, { method: 'getContent' }, null, function(
			contentResponse
		) {
			if (contentResponse) {
				scrapeFromContent(contentResponse);
			} else {
				chrome.tabs.sendMessage(tabId, 'getContentAndScrape');
				setTimeout(getContentAndScrape, 100);
			}
		});
	}

	function clipboard() {
		link.select();
		document.execCommand('copy');
	}

	function log(message) {
		chrome.runtime.sendMessage({
			method: 'log',
			message: message,
		});
	}

	function open() {
		window.open(link.value);
	}

	function regexFindAll(input, regex, i) {
		var items = [];
		var match;
		while ((match = regex.exec(input)) !== null) {
			items.push(match[i]);
		}
		return items;
	}

	function ajax(method, url, f) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				f(xhr);
			}
		};
		xhr.open(method, url, true);
		xhr.send();
	}

	function scrapeFromContent(contentResponse) {
		if (contentResponse.success) {
			var innerHTML = contentResponse.innerHTML;

			var regex = new RegExp(
				/<div class="track-name-wrapper ellipsis-one-line tracklist-top-align">(.*?)<\/div>/g
			);
			var songs = new Set(regexFindAll(innerHTML, regex, 1));

			if (songs.size == 0) {
				chrome.tabs.sendMessage(tabId, { method: 'alert', alert: 'No Spotify songs found'});
			} else {
				getVideoIdsFromSpotify(songs, function(videoIds) {
					link.value =
						'https://www.youtube.com/watch_videos?video_ids=' +
						videoIds.join(',');
				});
			}
		} else {
			chrome.tabs.sendMessage(tabId, 'scrapeFromContent');
		}
	}

	function getVideoIdsFromSpotify(songs, callback) {
		var videoIds = [];
		var remaining = songs.size;
		assign(remaining);
		var div = document.createElement('div');
		Array.from(songs).forEach(function(song, index) {
			var songName = song.match(/<span class="tracklist-name">(.+?)<\/span>/)[1];
			var artist = regexFindAll(song, /"\/artist\/\w+">(.+?)<\/a>/g, 1).join(', ');
			var album = song.match(/"\/album\/\w+">(.+?)<\/a>/)[1];
			div.innerHTML = songName + " " + artist + " " + album;
			var raw = div.innerText;
			var uri = encodeURIComponent(raw);
			ajax("GET", 'https://www.youtube.com/results?search_query='+uri, function(xhr) {
				assign(--remaining);
				console.log(xhr);
				videoIds[index] = getVideoIdFromYoutube(xhr.responseText);
				if (remaining === 0) {
					callback(videoIds);
				}
			});
		});
	}

	function getVideoIdFromYoutube(text) {
		chrome.tabs.sendMessage(tabId, text);
		return 'todo';
	}

	function assign(n) {
		if (n === 0) {
			chrome.browserAction.setBadgeText({text: ""});
		} else {
			chrome.browserAction.setBadgeText({text: n.toString()});
		}
	}

	document.getElementById('clipboard').onclick = clipboard;
	document.getElementById('scrape').onclick = scrape;
	document.getElementById('open').onclick = open;

	main();
})();
