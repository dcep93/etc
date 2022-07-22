/// firebase functions

function getDb(project) {
    var config = {
        databaseURL: `https://${project}-default-rtdb.firebaseio.com/`,
    };
    firebase.initializeApp(config);
    return firebase.database();
}

function listen(db, path, f) {
    const listenerRef = db.ref(path);
    listenerRef.on("value", function(snapshot) {
        var val = snapshot.val();
        f(val);
    });
}

function post(db, path, val) {
    Promise.resolve()
        .then(() => db.ref(path).set(val))
        .catch(alert);
}

//////

const READ_AND_POST_PERIOD_MS = 1000;
var state = null;

function main() {
    console.log("ff_draft", location.href);
    const db = getDb("react420");
    listen(db, "/ff/draft", receiveUpdate);
    readAndPostLoop(db);
}

function receiveUpdate(val) {
    console.log(val);
    state = val;
}

function readAndPostLoop(db) {
    console.log("readAndPostLoop");
    const raw = getFromDraft();
    const draft = Object.fromEntries(raw.map((name) => [name, true]));
    post(db, "/ff", { draft });
    setTimeout(() => readAndPostLoop(db), READ_AND_POST_PERIOD_MS);
}

function getFromDraft() {
    const table = document.getElementsByClassName("pick-history-tables")[0];
    if (!table) return [];
    return Array.from(table.getElementsByClassName("playerinfo__playername")).map(
        (e) => e.innerText
    );
}
main();