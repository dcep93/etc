(function() {
	// sort search results
	// rate limit
	// works for album

	console.log('popup');

	var link = document.getElementById('link');
	var tabId;

	function main() {
		link.onclick = function() {
			this.setSelectionRange(0, this.value.length);
		};

		chrome.tabs.query({ currentWindow: true, active: true }, function(
			tabs
		) {
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

	function open() {
		window.open(link.value);
	}

	function scrapeFromContent(contentResponse) {
		if (contentResponse.success) {
			var innerHTML = contentResponse.innerHTML;

			var regex = new RegExp(
				/<div class="track-name-wrapper ellipsis-one-line tracklist-top-align">(.*?)<\/div>/g
			);
			var songs = regexFindAll(innerHTML, regex, 1);

			if (songs.length == 0) {
				chrome.tabs.sendMessage(tabId, {
					method: 'alert',
					alert: 'No Spotify songs found',
				});
			} else {
				getVideoIdsFromSpotify(songs);
			}
		} else {
			chrome.tabs.sendMessage(tabId, 'scrapeFromContent');
		}
	}

	function getVideoIdsFromSpotify(songs) {
		var videoIds = [];
		var remaining = songs.length;
		assign(remaining);
		var div = document.createElement('div');
		songs.forEach(function(song, index) {
			try {
				var matches = song.match(
					/<span class="tracklist-name">(.+?)<\/span>.*?<span class="second-line ellipsis-one-line"><span.*?>(.*).*?<span class="second-line-separator" aria-label="in album">.*?<a .*?href="\/album\/\w+?">(.+?)<\/a>/
				);
				var songName = matches[1];
				var artistSpans = matches[2];
				var album = matches[3];

				var artist = regexFindAll(
					artistSpans,
					/<a .*?href="\/artist\/w+?">(.+?)<\/a>/g,
					1
				).join(', ');

				div.innerHTML = songName + ' ' + artist + ' ' + album;

				var query = div.innerHTML;
			} catch (e) {
				chrome.tabs.sendMessage(tabId, song);
				chrome.tabs.sendMessage(tabId, e.stack);
				display(videoIds, --remaining);
				return;
			}
			var raw = div.innerText;
			var uri = encodeURIComponent(raw);
			ajax(
				'GET',
				'https://www.youtube.com/results?sp=EgIQAQ%253D%253D&search_query=' +
					uri,
				function(xhr) {
					videoIds[index] = getVideoIdFromYoutube(
						xhr.responseText,
						query
					);
					display(videoIds, --remaining);
				}
			);
		});
	}

	function display(videoIds, remaining) {
		if (!assign(remaining)) return;
		videoIds = videoIds.filter(Boolean);
		if (videoIds.length === 0) {
			chrome.tabs.sendMessage(tabId, {
				method: 'alert',
				alert: 'Could not find youtube videos',
			});
		} else {
			link.value =
				'https://www.youtube.com/watch_videos?video_ids=' +
				videoIds.join(',');
		}
	}

	function assign(n) {
		if (n === 0) {
			chrome.browserAction.setBadgeText({ text: '' });
			return true;
		} else {
			chrome.browserAction.setBadgeText({ text: n.toString() });
			return false;
		}
	}

	function getVideoIdFromYoutube(text, query) {
		var resultsMatch = text.match(
			/window\["ytInitialData"\] = (.+?);\s+window\["ytInitialPlayerResponse"\]/,
			1
		);
		if (!resultsMatch || resultsMatch.length < 2) {
			chrome.tabs.sendMessage(
				tabId,
				'no videos found for ' + query + '!'
			);
			return null;
		}
		var parsed = JSON.parse(resultsMatch[1]);
		var results =
			parsed.contents.twoColumnSearchResultsRenderer.primaryContents
				.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		var highScore = -1;
		var videoId;
		results.forEach(function(result) {
			result = result.videoRenderer;
			var score = getScore(result);
			if (score > highScore) {
				highScore = score;
				videoId = result.videoId;
			}
		});
		return videoId;
	}

	function getScore(result) {
		// todo
		return 0;
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

	document.getElementById('clipboard').onclick = clipboard;
	document.getElementById('scrape').onclick = scrape;
	document.getElementById('open').onclick = open;

	main();
})();
