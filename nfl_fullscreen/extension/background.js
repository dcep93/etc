console.log("background", new Date());

chrome.browserAction.onClicked.addListener((tab) =>
  chrome.tabs.sendMessage(tab.id, {tabId: tab.id}, muted => 
    chrome.tabs.update(tab.id, { muted }))
);
