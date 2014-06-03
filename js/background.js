const RELEASE_NUM = 1;

var mC = new MediathekCore();

launch(run, newVersionCallback, firstRunCallback);

function launch (callback_fn, callbackNewVersion_fn, callbackFirstRun_fn) {
    chrome.storage.local.get(null, function(data) {
        if (typeof data.releaseNum == "undefined") {
            //First run detected
            data.releaseNum = RELEASE_NUM;

            save(function () {
                callbackFirstRun_fn();
                callback_fn();
            });
        } else {
            if (data.releaseNum < RELEASE_NUM) {
                //New version detected
                data.releaseNum = RELEASE_NUM;

                save(function () {
                    callbackNewVersion_fn();
                });
            }

            callback_fn();
        }
    
        function save (cb_fn) {
            chrome.storage.local.clear(function () {
                chrome.storage.local.set(data, function () {
                    cb_fn();
                });
            });
        }
    });
}

function newVersionCallback(data) {
    openTab("http://florianloch.github.io/MediathekDownload4Chrome/index.html?page=update&version=" + RELEASE_NUM);  
}

function firstRunCallback(data) {
    openTab("http://florianloch.github.io/MediathekDownload4Chrome/index.html?page=thank_you");
}

function openTab(url) {
    chrome.tabs.create({
        url: url,
        active: true
    });  
}

function run () {
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
}