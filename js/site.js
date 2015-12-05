document.addEventListener("DOMContentLoaded", function() {
    function loadHandeler() {
        console.log(this.responseText);
    }

    var req = new XMLHttpRequest();
    req.addEventListener("load", loadHandeler);
    req.open("GET", "https://raw.githubusercontent.com/stelf/en2bg4term/master/readme.md");
    req.send();
});
