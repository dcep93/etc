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

// prettier-ignore
function getDraft() { return Array.from(document.getElementsByClassName("pick-history")[0].getElementsByClassName("fixedDataTableCellGroupLayout_cellGroup")).map(row => ({ name_e: row.getElementsByClassName("playerinfo__playername")[0], rank_e: Array.from(row.children).reverse()[0] })).filter(_ref4 => { let { name_e, rank_e } = _ref4; return name_e && rank_e; }).map(_ref5 => { let { name_e, rank_e } = _ref5; return { name: name_e.innerText, rank: parseInt(rank_e.innerText) }; }); }

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
    const draft = getDraft();
    post(db, "/ff", { draft });
    setTimeout(() => readAndPostLoop(db), READ_AND_POST_PERIOD_MS);
}

main();