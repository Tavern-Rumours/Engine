const tooltipBox = document.getElementById('tooltip');
const tooltipContent = tooltipBox.querySelector('.content');

document.querySelectorAll('[data-tooltip], [data-tooltip-id]').forEach(tooltip => {
    // Desktop: hover
    tooltip.addEventListener('mouseenter', () => showTooltip(tooltip));
    tooltip.addEventListener('mouseleave', hideTooltip);

    // Mobile: tap
    tooltip.addEventListener('click', event => {
        event.stopPropagation();
        showTooltip(tooltip);
    });
})

// Tap anywhere to close on mobile
document.body.addEventListener('click', hideTooltip);

let scrollTimeout;

window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(hideTooltip, 100);
});

function showTooltip(tooltip) {
    const range = document.createRange();
    range.selectNodeContents(tooltip);
    const lines = range.getClientRects();

    const firstLine = lines[0];
    const secondLine = lines[1];

    let targetLine = (lines.length > 1 &&
        (firstLine.width / secondLine.width) < 0.3)
        ? secondLine
        : firstLine;

    const tooltipId = tooltip.getAttribute('data-tooltip-id')

    if (tooltipId !== null) {
        const template = document.getElementById(tooltipId)
        tooltipContent.innerHTML = ''
        tooltipContent.appendChild(template.content.cloneNode(true))
    }
    else tooltipContent.textContent = tooltip.getAttribute('data-tooltip')

    tooltipBox.style.opacity = 1;

    const tooltipRect = tooltipBox.getBoundingClientRect();

    let top = targetLine.top - tooltipRect.height - 10;
    let left = targetLine.left + targetLine.width / 2 - tooltipRect.width / 2;

    // Prevent clipping left/right
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth) {
    left = window.innerWidth - tooltipRect.width - 10;
    }

    // If no room above, show below instead
    if (top < 10) {
    top = targetLine.bottom + 10;
    tooltipBox.setAttribute('data-arrow', 'top');
    } else {
    tooltipBox.setAttribute('data-arrow', 'bottom');
    }

    tooltipBox.style.left = `${left}px`;
    tooltipBox.style.top = `${top}px`;
}

function hideTooltip() {
    tooltipBox.style.opacity = 0;
}