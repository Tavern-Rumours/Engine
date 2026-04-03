document.addEventListener("click", (e) => {
    const sidebar = document.querySelector(".sidebar-nav");
    const backdrop = document.getElementById("backdrop");
    const menuToggle = e.target.matches("#menu-toggle");
    const backdropToggle = e.target.matches("#backdrop");

    if (window.innerWidth <= 960) {
        if (menuToggle) {
            sidebar.classList.toggle("open");
            backdrop.classList.toggle("show");
            document.body.classList.toggle("no-scroll");
        }
        else if (backdropToggle) {
            sidebar.classList.remove("open");
            backdrop.classList.remove("show");
            document.body.classList.toggle("no-scroll");
        }
        else return;
    }
    else {
        if (menuToggle && sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
        else if (menuToggle) {
            sidebar.classList.toggle("collapsed");
        }
        else return;
    }
});