function MediathekCore () {
	var arHandler = new Array();
	var sCurrentURL;
	var oCurrentHandler;
	
	this.addMediathekHandler = function (oHandler) {
		//Add reference to itself
		oHandler._parent = this;
		
		arHandler.push(oHandler);
	};
	
	//Return information about this specific mediathek; if this URL doesn't match any of the handlers, "null" is returned.
	//This method also sets the currentHandler, so it has to be the starting point for each and every approach
	//The information is returned using the following syntax:
	/*
		{
			name: "Name",
			hp: "URL of homepage",
			logo: "URL of logo",
			icon: "URL of icon"
		}
	*/
	this.getMediathekInfo = function (sURL) {
		var oHandler = getHandlerForURL(sURL);
		
		if (!oHandler) {
			return null;
		}
		
		var res = {};
		res.name = oHandler.getNameOfChannel();
		res.hp = oHandler.getHomepage();
		res.logo = oHandler.getLogoURL();
		res.icon = "mediathekIcons/" + oHandler.getNameOfChannel() + ".png";
		
		oCurrentHandler = oHandler;
		sCurrentURL = sURL;
		
		return res;
	};
	
	this.downloadVideo = function (videoUrl_o) {
		if ("name" in videoUrl_o && "url" in videoUrl_o) {
			var filename = makeFileNameValid(decodeEntities(videoUrl_o.name)) + "." + extractFileNameEnding(videoUrl_o.url);
			console.log("Download video with name: " + filename);

			chrome.downloads.download({
				url: videoUrl_o.url,
				filename: filename, //Needs to checked, it seems Chrome does not want to download the file if the filename contains invalid characters
				saveAs: true
			});
		}
	};

	// Characters interpreted as invalid: /, \, ?, %, *, :, |, ", <, > (regarding to the article at: http://en.wikipedia.org/wiki/Filename)
	function makeFileNameValid (filename_s) {
		var regEx = /\/|\\|\?|%|\*|:|\||<|>/g;

		var newFilename = filename_s.replace(regEx, "_");
		return newFilename.replace(/"/g, "'");
	}

	//Taken from http://stackoverflow.com/a/13091266/1339560, slightly modified
	function decodeEntities (str) {
	    // Remove HTML Entities
	    var element = document.createElement('div');

	    if(str && typeof str === 'string') {

	        // Escape HTML before decoding for HTML Entities
	        str = escape(str).replace(/%26/g,'&').replace(/%23/g,'#').replace(/%3B/g,';');

	        element.innerHTML = str;
	        if(element.innerText){
	            str = element.innerText;
	            element.innerText = '';
	        }else{
	            // Firefox support
	            str = element.textContent;
	            element.textContent = '';
	        }
	    }
	    return unescape(str);
	}	

	function extractFileNameEnding (path_s) {
		for (var i = path_s.length - 1; i >= 0; i--) {
			if (path_s.charAt(i) === '.') {
				return (i + 1 == path_s.length) ? "" : path_s.substr(i + 1);
			}
		}
	}

	//For the syntax of the returned object see the according comment in "doc/Example handler.js" because
	//this method is actually just a delegating/forwarding method
	this.getVideoFileURLs = function (fnCallback) {
		oCurrentHandler.getVideoFileURLs(sCurrentURL, fnCallback);
	};
	
	this.getFileSizes = function (oVideoURLs, fnCallback) {
		console.log(oVideoURLs);

		function requestSize(iCounter) {
			if (iCounter < oVideoURLs.length) {
				new Request({
				  url: oVideoURLs[iCounter].url,
				  onComplete: function (response, header, status) {	
				  		if (status == 200) {
					  		oVideoURLs[iCounter].exists = true;				  			
					  		oVideoURLs[iCounter].fs = header["Content-Length"];
					  		console.log("Size: " + header["Content-Length"]);
					  	}
					  	else {
					  		//Not found, so this URL might not exist
					  		oVideoURLs[iCounter].exists = false;
					  		console.log("URL seems not to exist.");
					  	}

					  	requestSize(iCounter + 1);
				  }
				}).head();
			}
			else {
				console.log(oVideoURLs);
				
				fnCallback(oVideoURLs);
			}
		}
		
		requestSize(0);
	};
	
	this.listMediatheken = function () {
		var arMediatheken = new Array();
		for (var i = 0; i < arHandler.length; i++) {
			arMediatheken.push({
				name: arHandler[i].getNameOfChannel(),
				url: arHandler[i].getHomepage()	
			});
		}
		
		return arMediatheken;
	};
	
	function getHandlerForURL (sURL) {
		
		for (var i = 0; i < arHandler.length; i++) {
			var oHandler = arHandler[i];
			
			if (oHandler.isHandlerForURL(sURL)) {
				return oHandler;
			}
		}
		
		return null;
	}
};

function Request(options_o) {
	var self = this;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && "onComplete" in options_o) {
			options_o.onComplete(xhr.response, parseHeaders(xhr.getAllResponseHeaders()), xhr.status);
		}
	};

	function prepareOpen (method) {
		xhr.open(method, options_o.url);		

		if ("headers" in options_o) {
			for (var key in options_o.headers) {
				xhr.setRequestHeader(key, options_o.headers[key]);
			}
		}
	}

	this.head = function () {
		prepareOpen("HEAD");
		xhr.send();
	};

	this.get = function () {
		prepareOpen("GET");
		xhr.send();
	};

	function parseHeaders (header_s) {
		var header = {};
		var lines = header_s.split("\r\n");

		for (var i = 0; i < lines.length; i++) {
			for (var j = 0; j < lines[i].length; j++) {
				if (lines[i].charAt(j) == ":") {
					header[lines[i].substr(0, j)] = (lines[i].length > j + 2) ? lines[i].substr(j + 2) : ""; //Plus 2 because of leading whitespace
					break;
				}
			}
		}

		return header;
	}
};