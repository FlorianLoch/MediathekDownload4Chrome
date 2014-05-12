var videoUrls;
var bg = chrome.extension.getBackgroundPage();

$(function init () {
	console.info("Test");
	var cntnr = $("#container");

	console.info(cntnr);

	videoUrls = bg.mC.getVideoFileURLs(function (videoUrls_ar) {
		for (var i = 0; i < videoUrls_ar.length; i++) {
			var btn = $("<button>" + videoUrls_ar[i].desc + "</button>").click((function (i) {
				return function () {
					console.log(videoUrls_ar[i]);
					bg.mC.downloadVideo(videoUrls_ar[i]);
				}
			})(i));
			cntnr.append(btn);
			console.log(btn);
			console.info("appended button");
		}

		console.log("Callback called");
	});
});