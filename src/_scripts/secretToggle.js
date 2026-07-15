const secretToggle = document.getElementById('secretToggle');
const lsSecretToggle = localStorage.getItem("secretToggle");

if (secretToggle !== null) {
    if (lsSecretToggle !== null && lsSecretToggle === "true") {
        applyToggle(lsSecretToggle);
        secretToggle.checked = true;
    }

    secretToggle.addEventListener('click', () => {
        localStorage.setItem("secretToggle", secretToggle.checked);
        applyToggle(secretToggle.checked);
    });
}

function applyToggle(toggledOn) {
    document.querySelectorAll('.secret').forEach(secret => {
        secret.style.display = toggledOn ? "flow-root" : "none";
    })
}
