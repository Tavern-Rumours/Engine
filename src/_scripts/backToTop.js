document.addEventListener('DOMContentLoaded', function() {
    var scrollMargin = window.innerHeight * 0.5;
    let btn_btt = document.getElementById("btn_btt");

    window.onscroll = function() { scrollFunction() };

    function scrollFunction() {
        if (document.body.scrollTop > scrollMargin || document.documentElement.scrollTop > scrollMargin) {
            btn_btt.classList.add("visible");
        } else {
            btn_btt.classList.remove("visible");
        }
    }
});

function backtotop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}