var videoUrls;
var bg = chrome.extension.getBackgroundPage();

angular.module("md4c", ["ngAnimate"]).controller("md4c.mainCntrl", ["$scope", function ($scope) {
	$scope.loading = true;
	$scope.videos = [];

	bg.mC.getVideoFileURLs(function (videoUrls_ar) {
		$scope.videos = videoUrls_ar;
		$scope.loading = false;

		$scope.$digest();
	});

	$scope.videosFound = function () {
		return ($scope.videos.length > 0);
	}

	$scope.download = function (index_i) {
		bg.mC.downloadVideo($scope.videos[index_i]);
	}

	$scope.getName = function () {
		return decodeEntities($scope.videos[0].name);

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
	}
}]);

angular.module("md4c").animation(".plainfade", function () {
	return {
		enter: function (element, done) {
			var jq = jQuery(element);
			jq.css({"display": "none"});

			jq.fadeIn(500, function () {
				done();
			});
		},
		leave: function (element, done) {
			var jq = jQuery(element);
			jq.fadeOut(500, function () {
				done();
			});
		}
	};
});