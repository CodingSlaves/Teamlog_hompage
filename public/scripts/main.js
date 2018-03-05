onload = function () {
    var html = document.querySelector("html");


    html.classList.add("open-loading");

    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    }
}