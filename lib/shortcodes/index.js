import aloud from "./aloud.js";
import button from "./button.js";
import { credits, image } from "./image.js";
import quote from "./quote.js";
import { secret, secretToggle } from "./secret.js";
import { mainSidebar, sidebar, sidebarLeft, sidebarRight } from "./sidebar.js";
import spoiler from "./spoiler.js";
import { container, mark, textEnrichment } from "./textEnrichment.js";
import tooltip from "./tooltip.js";

const pairedShortcodes = {
    quote,
    aloud,
    spoiler,
    mark,
    image,
    sidebar,
    sidebarLeft,
    sidebarRight,
    container,
    button,
    secret,
    secretToggle,
}

const shortcodes = {
    ...textEnrichment,
    credits,
}

export default function registerShortcodes(eleventy, env, markdown) {

    for (const [name, handler] of Object.entries(pairedShortcodes)) {
        eleventy.addPairedShortcode(name, handler(env));
    }

    eleventy.addPairedShortcode("mainSidebar", mainSidebar(env, markdown));

    const tooltipFunc = tooltip(markdown);

    eleventy.addPairedShortcode(
        "tooltip",
        function(...args) {
            return tooltipFunc.call(this, ...args)
        }
    );

    for (const [name, handler] of Object.entries(shortcodes)) {
        eleventy.addShortcode(name, handler);
    }
}
