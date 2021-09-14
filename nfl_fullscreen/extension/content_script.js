chrome.runtime.onMessage.addListener(execute);

var muted = undefined;

function execute(message, sender, sendResponse) {
  if (muted === undefined) {
    Array.from(document.getElementsByTagName("iframe")).find(
      (i) => i.src && i.src !== "about:blank"
    ).style = `
    position: fixed;
    right: 0px;
    bottom: 0px;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: 100;
    `;

    muted = false;
  } else {
    muted = !muted;
  }
  sendResponse(muted);
}
