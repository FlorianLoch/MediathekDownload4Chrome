function Frontend(container_id_s, backend_o) {
	var container_id = container_id_s;
	var backend = backend_o

	this.showLoadingLayer = function() {
		var node = document.createElement("div");
		node.setAttribute("id", "layerLoading");

		var img = document.createElement("img");
		img.setAttribute("src", "images/loading.gif");

		node.appendChild(img);

		this.setLayer(node);
	};

	this.showErrorLayer = function(error_msg_s) {
		var node = document.createElement("div");
		node.setAttribute("id", "layerError");

		var text = document.createElement("p");
		text.appendChild(document.createTextNode(error_msg_s));

		var img = document.createElement("img");
		img.setAttribute("src", "images/sad_pinguin.png");		
	
		node.appendChild(text);
		node.appendChild(img);

		this.setLayer(node);
	};

	this.showSelectionLayer = function(video_urls_o) {
		var node = document.createElement("div");
		node.setAttribute("id", "layerSelection");

		for (var i = 0; i < video_urls_o.length; i++) {
			var video_url = video_urls_o[i];

			var btn = document.createElement("button");
			btn.appendChild(document.createTextNode(video_url.url));
			btn.addEventListener("click", (function (url_s) {
				return function () {
					backend.downloadVideo(urls_s);
				};
			})(video_url.url));

			node.appendChild(btn);
		}

		this.setLayer(node);
	};


	this.setLayer = function(node) {
		$(container_id).empty();
		$(container_id).append(node);
	};
}