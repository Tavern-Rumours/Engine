document.addEventListener("click", (e) => {
    const sidebar = document.querySelector(".sidebar-nav");
    const backdrop = document.getElementById("backdrop");
    const menuToggle = e.target.closest("#menu-toggle");
    const backdropToggle = e.target.closest("#backdrop");

    if (window.innerWidth <= 960) {
        if (menuToggle) {
            sidebar.classList.toggle("open");
            backdrop.classList.toggle("show");
            document.body.classList.toggle("no-scroll");
        } else if (backdropToggle) {
            sidebar.classList.remove("open");
            backdrop.classList.remove("show");
            document.body.classList.toggle("no-scroll");
        }
    } else if (menuToggle) {
        sidebar.classList.toggle("collapsed");
    }
});
