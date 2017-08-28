chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
    	switch (request.method) {
    		case "getContent":
    			sendResponse({success: true, innerHTML: document.body.innerHTML});
    			break;
    		case "noNewVideos":
    			alert('No new videos detected!');
    			break;
    		default:
    			console.log('default', request);
    	}
    }
);
