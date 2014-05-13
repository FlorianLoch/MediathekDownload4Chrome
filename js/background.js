var mC = new MediathekCore();

//Add all mediathek-handlers to the core
mC.addMediathekHandler(new ARDHandler());
mC.addMediathekHandler(new ZDFHandler());

chrome.tabs.onUpdated.addListener(function(tabId_i, changeInfo_o, tab_Tab) {
    if (!("url" in changeInfo_o)) return;

    var info = mC.getMediathekInfo(changeInfo_o.url);
    if (info != null) {
        chrome.pageAction.setTitle({
            tabId: tabId_i,
            title: info.name
        });

        chrome.pageAction.show(tabId_i);
    } else {
        chrome.pageAction.hide(tabId_i);
    }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    function (req) {
        // Replace the User-Agent header when the "change-user-agent"-header exists
        // Replacement will be the value of "change-user-agent"-header
        var headers = req.requestHeaders;
        var userAgentHeaderIndex = -1;
        var userAgentReplaceHeaderIndex = -1;
        for (var i = 0; i < headers.length; i++) {
            var name = headers[i].name.toLowerCase();
            if (name === "change-user-agent") {
            	userAgentReplaceHeaderIndex = i;
            }
            else if (name === "user-agent") {
            	userAgentHeaderIndex = i;
            }
        }

        if (userAgentReplaceHeaderIndex >= 0) {
        	if (userAgentHeaderIndex >= 0) {
        		headers[userAgentHeaderIndex].value = headers[userAgentReplaceHeaderIndex].value;
        	}
        	else {
        		headers.push({
        			name: "user-agent",
        			value: headers[userAgentReplaceHeaderIndex].value
        		});
        	}
        }
        return {
            requestHeaders: headers
        };
    }, {
        urls: ["http://*.zdf.de/*"] //Request filter
    }, [
    	'requestHeaders', 
    	"blocking"
    ]
);