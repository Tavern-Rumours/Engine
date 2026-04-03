document.addEventListener("click", (e) => {
    if (!e.target.matches(".toggle")) return;

    const btn = e.target;
    const container = btn.parentElement;
    const children = container.querySelector(".children");

    const isOpen = btn.dataset.open === "true";

    btn.dataset.open = (!isOpen).toString();
    btn.textContent = isOpen ? "+" : "-";

    if (children) {
        children.style.display = isOpen ? "none" : "block";
    }
})