function ZDFHandler() {
	//Simply returns the name of the channel
	this.getNameOfChannel = function () {
		return "ZDF";
	};

	//Returns the URL of the logo/icon of this mediathek
	this.getLogoURL = function () {
		return "http://upload.wikimedia.org/wikipedia/commons/thumb/0/02/ZDF.svg/200px-ZDF.svg.png";
	};

	//Returns the URL of the landing page of the according mediathek
	this.getHomepage = function () {
		return "http://www.zdf.de/ZDFmediathek/hauptnavigation/startseite?flash=off";
	};

	//A URL is given to this method and it has to decide whether this object is the right handler for this url/mediathek
	this.isHandlerForURL = function (sURL) {
		console.log("Check " + sURL);
		return (sURL.search(/http:\/\/www\.zdf\.de\/ZDFmediathek.*\/beitrag\/video\/.*/) > -1);
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
	this.getVideoFileURLs = function (sURL, fnCallback) {
		var self = this;

		//Check if URL is of Flash-version and transform it if needed
		if (sURL.indexOf("?flash=off") === -1) {
			var videoIdentifier = /beitrag\/video(\/[0-9]+.*$)/.exec(sURL);
			sURL = "http://www.zdf.de/ZDFmediathek/beitrag/video" + videoIdentifier[1] + "?flash=off";
			console.log(sURL);
		}

		sURL = sURL + "&ipad=true";

		new Request({
		  url: sURL,
		  onComplete: function (response, header, status) {
		  	  var src = response;

		  	  //Parse the page for the URLs
		  	  var prefixName = "<h1 class=\"beitragHeadline\">";
		  	  var prefixHigh = "<li>DSL 1000 <a href=\"";
		  	  var prefixVeryHigh = "<li>DSL 2000 <a href=\"";

		  	  var name = findString(src, prefixName, 0, "<");
		  	  var high = findString(src, prefixHigh, name.offset, "\"");
		  	  var veryHigh = findString(src, prefixVeryHigh, high.offset, "\"");

		  	  var res = new Array();
		  	  res[0] = {};
		  	  res[0].desc = "Mittlere Qualität";
		  	  res[0].fs = "";
		  	  res[0].url = high.str;
		  	  res[0].name = name.str;
		  	  res[1] = {};
		  	  res[1].desc = "Hohe Qualität";
		  	  res[1].fs = "";
		  	  res[1].url = veryHigh.str;
		  	  res[1].name = name.str;
		  	  res[2] = {};
		  	  res[2].desc = "HD (720p)";
		  	  res[2].fs = "";
		  	  res[2].url = veryHigh.str.substring(0, veryHigh.str.length - 6).concat("hd.mp4");
		  	  res[2].name = name.str;
		  	  res[3] = {};
		  	  res[3].desc = "HD (720p)";
		  	  res[3].fs = "";
		  	  res[3].url = veryHigh.str.substring(0, veryHigh.str.length - 6).concat("hd.mov");
		  	  res[3].name = name.str;

		  	  console.log(name.str);

		  	  //Give the result back via the callback-function
		  	  self._parent.getFileSizes(res, fnCallback);
		  }
		}).get();
	};

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
