function fileToPromise(fileName) {
  const url = chrome.runtime.getURL(fileName);
  return fetch(url)
    .then((response) => response.text())
    .then((code) => window.ts.transpile(code))
    .then(eval);
}

fileToPromise("v.ts");
