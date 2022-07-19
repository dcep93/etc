function main() {
    console.log("main", location.href);
    setTimeout(main, 1000);
    document.getElementsByClassName("top-notification-button")[0].click();
}

if (location.href.startsWith("https://colonist.io")) main();