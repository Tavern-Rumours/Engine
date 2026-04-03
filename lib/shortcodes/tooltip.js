export default function tooltip(markdown) {
    return function(content, label, id) {
        if (id) {
            if (!this.page.extendedTooltips) this.page.extendedTooltips = [];

            const renderedContent = markdown.render(content);
            this.page.extendedTooltips.push({ id, renderedContent });

            return `<span class="tooltip" data-tooltip-id="${id}">${label}</span>`;
        }
        else {
            return `<span class="tooltip" data-tooltip="${content.trim()}">${label}</span>`
        }
    }
}
