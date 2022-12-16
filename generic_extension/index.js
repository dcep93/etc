function execute() {
  const paths = [
    {
      p: /https:\/\/www\.nytimes\.com\/games\/wordle\/index\.html/,
      jss: ["wordle.txt", "wordle.js"],
    },
    {
      p: new RegExp(
        "https://www.buildinglink.com/V2/Tenant/Postings/PostingAreas.aspx"
      ),
      jss: ["buildinglink_postings.js"],
    },
  ];

  const jss = paths
    .filter((o) => location.href.match(o.p))
    .flatMap((o) => o.jss);

  allPromises(jss.map((js) => () => fileToPromise(js))).catch(alert);
}

function allPromises(arr) {
  if (arr.length === 0) return Promise.resolve();
  return Promise.resolve()
    .then(() => arr.shift()())
    .then(() => allPromises(arr));
}

function fileToPromise(fileName) {
  const url = chrome.runtime.getURL(`extensions/${fileName}`);
  if (fileName.endsWith(".txt")) {
    const d = document.createElement("data");
    d.setAttribute("id", fileName);
    document.head.appendChild(d);
    return fetch(url)
      .then((resp) => resp.text())
      .then((text) => (d.innerHTML = text));
  }
  const s = document.createElement("script");
  s.src = url;
  return new Promise((resolve, reject) => {
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

execute();
