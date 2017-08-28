chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
    	switch (request.method) {
    		case "getContent":
    			sendResponse({success: true, innerHTML: document.body.innerHTML});
    			break;
    		case "noVideos":
    			alert('No videos detected!');
    			break;
    		default:
    			console.log('default', request);
    	}
    }
);
