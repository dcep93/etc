console.log("background");

const fetch_cache = {};

chrome.runtime.onMessageExternal.addListener(function (
  request,
  _,
  sendResponse
) {
  return execute(request)
    .then((result) => sendResponse(result))
    .catch((err) => sendResponse({ ok: false, err: err.message }));
});

function execute(request) {
  return new Promise((resolve, reject) => {
    if (request.storage) {
      if (request.storage.action === "get") {
        console.log("get", request.storage.keys);
        chrome.storage.local.get(request.storage.keys, (result) =>
          resolve({ ok: true, result })
        );
      }
      if (request.storage.action === "save")
        chrome.storage.local.set(request.storage.save, () =>
          resolve({ ok: true })
        );
    }
    if (request.fetch) {
      const key = request.fetch.url;
      const cached = fetch_cache[key];
      const now = Date.now();
      if (now - cached?.timestamp < request.fetch.maxAgeMs)
        return resolve(cached.cache);
      return fetch(request.fetch.url, request.fetch.options).then((resp) => {
        if (!resp.ok)
          return resp.text().then((err) => resolve({ err, ...resp }));
        (request.fetch.json ? resp.json() : resp.text())
          .then((msg) => ({ msg, ok: true }))
          .then((cache) => {
            if (!request.fetch.noCache) {
              fetch_cache[key] = { timestamp: now, cache };
            }
            return cache;
          })
          .then(resolve);
      });
    }
  });
}
