chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
    	console.log(request);
        if(request.method == "getContent"){
            sendResponse({success: true, innerHTML: document.body.innerHTML});
        }
    }
);
