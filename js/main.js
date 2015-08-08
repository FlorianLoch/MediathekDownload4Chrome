// ?page=X
// X might be:
// - thank_you
// - update
// - NOTHING

$(function init() {
    var params = getQueryVariables();
    var divsToShow = [];

    if ("page" in params) {
        // THANK YOU
        if (params.page === "thank_you") {
            divsToShow = ["header", "thankyou", "donation", "imprint"];
        }
        // UPDATE HISTORY
        else if (params.page === "update") {
            divsToShow = ["header", "updates", "thankyou", "donation", "imprint"];
            if ("version" in params) {
                $("#version_number").text("Ihre Version: " + params.version); //To prevent XSS
            }
        }
    }
    // DEFAULT PAGE
    else {
        divsToShow = ["header", "buttons", "features", "usage", "donation", "imprint"];
    }

    for (var i = 0; i < divsToShow.length; i++) {
        $("#" + divsToShow[i]).show();
    }

    // Taken from http://css-tricks.com/snippets/javascript/get-url-variables/, modified
    function getQueryVariables() {
        var vars = window.location.search.substring(1).split("&");
        var res = {};

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            res[pair[0]] = pair[1];
        }
        return res;
    }
});
