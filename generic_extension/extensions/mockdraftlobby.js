const LOOP_PERIOD_MS = 1000;

function main() {
    loop();
}

function loop() {
    Array.from(document.getElementsByTagName("td")).forEach(
        (e) =>
        (e.style.border = e.innerText.match(/2-Team H2H Points PPR Mock$/) ?
            "2px solid black" :
            "")
    );
    setTimeout(loop, LOOP_PERIOD_MS);
}

main();