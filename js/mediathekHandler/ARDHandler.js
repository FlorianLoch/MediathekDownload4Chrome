/*

	The pattern for downloading videos from ARD-Mediathek is the following: 
	1: Take the given url, e. g.: http://www.ardmediathek.de/puls/startrampe/feathery-slow-version-startrampe-live-session?documentId=17262134
	2: Extract the end part, in this case "feathery-slow-version-startrampe-live-session?documentId=17262134".
	3: Replace "documentId" by "docId"
	4: Append this string to "m.ardmediathek.de", e. g.: m.ardmediathek.de/feathery-slow-version-startrampe-live-session?docId=17262134
	5: Now ARD delivers you the mobile page for this video - here you can extract around 4 video URLs.
	
	Supported pages should match the following pattern: http://www.ardmediathek.de/.*?documentId=[0-9]*

*/

function ARDHandler() {
    //Simply returns the name of the channel
    this.getNameOfChannel = function() {
        return "ARD";
    };

    //Returns the URL of the logo/icon of this mediathek 
    this.getLogoURL = function() {
        return "";
    };

    //Returns the URL of the landing page of the according mediathek
    this.getHomepage = function() {
        return "http://www.ardmediathek.de/";
    };

    //A URL is given to this method and it has to decide whether this object is the right handler for this url/mediathek
    this.isHandlerForURL = function(sURL) {
        if (sURL.search("http://www.ardmediathek.de/.*?documentId=[0-9]*") > -1) {
            return true;
        } else {
            return false;
        }
    };

    //Result needs to have this JSON-syntax:
    /*
		[
			{
				desc: "Low Quality",
				fs: "Filesize in Bytes",
				url: "http://anywhere...",
				name: "Name"
			},
			{
				desc: "High Quality",
				fs: "see above",
				url: "http://idontknowwherebutishastobesomewhere",
				name: "Name"
			}
		]
	*/
    this.getVideoFileURLs = function(sURL, fnCallback) {
        sURL = buildURLOfMobileSite(sURL);

        if (sURL == null) {
            fnCallback(null);
            return;
        }

        var self = this;

        console.log("Started searching!");
        console.log(sURL);

        new Request({
            url: sURL,
            onComplete: function(response, header, status) {
                var res = [];

                //Returns something like: <source data-quality="M" src="http://media.ndr.de/progressive/2014/0511/TV-20140511-2304-1942.hi.mp4"/>
                var sourceBlocks = response.match(/<source data-quality="(S|M|L)".*?>/g);

                if (sourceBlocks == null) {
                    fnCallback(res); //With the empty array the frontendWorker knows, that no videos have been found
                    console.log("No URLs found!");
                    return;
                }

                var name = findString(response, "<h1 class=\"clipTitel\">", 0, "<").str;

                var highDetected = false; //ARD uses to have to streams labeled with "L" for high quality, but one has much bigger filesize and therefore is probably much better in quality. This one is placed after the other. So the second detected gets ranked "Sehr hohe Qualität"
                for (var i = 0; i < sourceBlocks.length; i++) {
                	var vid = {};
                	vid.desc = "Unbekannte Qualität";

                	var qualDetected = findString(sourceBlocks[i], "data-quality=\"", 0, "\"").str;

                	if (qualDetected == "S") {
                		vid.desc = "Niedrige Qualität";
                	}
                	else if (qualDetected == "M") {
                		vid.desc = "Mittlere Qualität";
                	}
                	else if (qualDetected == "L") {
                		vid.desc = (highDetected) ? "Sehr hohe Qualität" : "Hohe Qualität";
                        highDetected = true;
                	}

                	vid.fs = "";
                	vid.name = name;
                	vid.url = findString(sourceBlocks[i], "src=\"", 0, "\"").str;

                    //Video with low quality should appear at the beginning (ARD always places it after the others...)
                	if (qualDetected == "S") {
                        res.unshift(vid);
                        continue;
                    }

                    res.push(vid);
                }

                //Give the result back via the callback-function
                self._parent.getFileSizes(res, fnCallback);
            }
        }).get();
    };

    function buildURLOfMobileSite(sURL) {
        //For description of the following lines see comment above
        try {
            var tmp = sURL.substr(indexOfCharReverse(sURL, "/") + 1);
            tmp = tmp.replace("documentId", "docId");

            var mobURL = "http://m.ardmediathek.de/" + tmp;

            return mobURL;
        } catch (e) {
            console.log("Could not build URL of mobile site of ARD-Mediathek: " + e);
            return null;
        }
    }

    function indexOfCharReverse(sString, cChar) {
        for (var i = sString.length - 1; i >= 0; i--) {
            if (sString.charAt(i) == cChar) {
                return i;
            }
        }

        return -1;
    }

    function findString(sHTML, sPrefix, iOffset, cEndChar) {
        var posPrefix = sHTML.indexOf(sPrefix, iOffset);

        if (posPrefix == -1) {
            var res = {};
            res.str = null;
            res.offset = 0;

            return res;
        }

        var str = "";

        for (var i = posPrefix + sPrefix.length; i < sHTML.length; i++) {
            if (sHTML.charAt(i) == cEndChar) {
                break;
            }

            str = str + sHTML.charAt(i);
        }

        var res = {};
        res.str = str;
        res.offset = i;

        return res;
    }
};
