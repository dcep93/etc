console.log("background");

const fetch_cache = {};

chrome.runtime.onMessageExternal.addListener(function (
  request,
  _,
  sendResponse
) {
  if (request.storage) {
    if (request.storage.action === "get") {
      chrome.storage.local.get(request.storage.keys, (result) => {
        sendResponse(result);
      });
    }
    if (request.storage.action === "save") {
      chrome.storage.local.set(request.storage.save, () => sendResponse(true));
    }
  }
  if (request.fetch) {
    const key = JSON.stringify(request.fetch);
    const cached = fetch_cache[key];
    const now = Date.now();
    if (now - cached?.timestamp < request.fetch.maxAgeMs)
      return sendResponse(cached.cache);
    return fetch(request.fetch.url, request.fetch.options).then((resp) => {
      if (!resp.ok)
        return resp.text().then((text) => sendResponse({ text, ...resp }));
      (request.fetch.json ? resp.json() : resp.text())
        .then((msg) => ({ msg, ok: true }))
        .then((cache) => {
          fetch_cache[key] = { timestamp: now, cache };
          return cache;
        })
        .then(sendResponse);
    });
  }
});
