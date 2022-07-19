function main() {
    console.log("main", location.href);
    if (
        location.href !=
        "https://www.elearning.dmv.ca.gov/pluginfile.php/51/mod_scorm/content/5/index_lms.html"
    )
        return;
    const videos = Array.from(document.getElementsByTagName("video")).map((e) => {
        e.volume = 0;
        e.playbackRate = 4;
        e.pause = () => console.log("paused");
        e.play();
        return e;
    });
    console.log(videos);
    setTimeout(main, 1000);
}

main();