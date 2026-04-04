import quote from "./quote.js";
import aloud from "./aloud.js";
import spoiler from "./spoiler.js";
import { image, credits } from "./image.js";
import { textEnrichment, mark, container } from "./textEnrichment.js";
import tooltip from "./tooltip.js";
import sidebar from "./sidebar.js";

const pairedShortcodes = {
    quote,
    aloud,
    spoiler,
    mark,
    image,
    sidebar,
    container,
}

const shortcodes = {
    ...textEnrichment,
    credits,
}

export default function registerShortcodes(eleventy, env, markdown) {

    for (const [name, handler] of Object.entries(pairedShortcodes)) {
        eleventy.addPairedShortcode(name, handler(env));
    }

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
