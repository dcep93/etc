function execute() {
    const paths = [{
        p: /https:\/\/fantasy\.espn\.com\/football\/draft.*/,
        jss: [
            "firebase/firebase-app.js",
            "firebase/firebase-database.js",
            "ff_draft.js",
        ],
    }, ];

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
    const s = document.createElement("script");
    s.src = url;
    return new Promise((resolve, reject) => {
        s.onload = resolve;
        document.head.appendChild(s);
    });
}

execute();