chrome.runtime.onMessage.addListener(execute);

var muted = undefined;

function execute(message, sender, sendResponse) {
  if (muted === undefined) {
    fullscreen(document.getElementById('video-player'));
    fullscreen(document.getElementsByTagName('iframe')[0]);
    muted = false;
  } else {
    muted = !muted;
    sendResponse(muted);
  }
}

function fullscreen(element) {
  console.log(element);
  element.style = `
position: fixed;
right: 0px;
bottom: 0px;
min-width: 100%;
min-height: 100%;
width: auto;
height: auto;
z-index: 100;
`;
}
