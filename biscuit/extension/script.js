chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "getContent"){
            sendResponse({success: true, innerHTML: document.body.innerHTML});
        }
    }
);
