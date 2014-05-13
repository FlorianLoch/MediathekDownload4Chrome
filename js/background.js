var mCList = {};

//Add all mediathek-handlers to the core


chrome.tabs.onRemoved.addListener(function (tabId_i) {
    delete mCList[tabId_i];
});

chrome.tabs.onUpdated.addListener(function(tabId_i, changeInfo_o, tab_Tab) {
    if (!("url" in changeInfo_o)) return;

    if (mCList[tabId_i] == undefined) initMC(tabId_i);

    var info = mCList[tabId_i].getMediathekInfo(changeInfo_o.url);
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

function initMC(tabId_i) {
    mCList[tabId_i] = new MediathekCore();
    mCList[tabId_i].addMediathekHandler(new ARDHandler());
    mCList[tabId_i].addMediathekHandler(new ZDFHandler());
}

//Tab onclose to remove not more needed mc instances

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

function getVideoFileURLs(tabId_i, cb_fn) {
    mCList[tabId_i].getVideoFileURLs(cb_fn);
}

function downloadVideo(tabId_i, cb_fn) {
    mCList[tabId_i].downloadVideo(cb_fn);
}