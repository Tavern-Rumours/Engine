// Imports
import markdown from './lib/markdown.config.js';
import getNunjucksEnv from './lib/nunjucks.js';
import registerShortcodes from './lib/shortcodes/index.js';
import buildNavigationGraph from './lib/navigation.js';

/**
 * Eleventy Configuration
 * @param {object} eleventy - Eleventy configuration
 * @returns {object} Updated Eleventy configuration
 */
export default function (eleventy) {

    const workspace = "src";
    const input = "content";
    const output = "www";
    const components = "_includes";
    const data = "_data";
    const layouts = "_layouts";
    const scripts = "_scripts";
    const styles = "_styles";
    const images = `${input}/img`;

    // Nunjuck Environment
    const nunjucksEnv = getNunjucksEnv(`${workspace}/${components}`);

    // Setting Libraries
    eleventy.setLibrary("md", markdown);
    eleventy.setLibrary("njk", nunjucksEnv);

    // Creating Collection for Navigation
    eleventy.addCollection("navGraph", function(collections) {
        const pages = collections.all ?? collections.items;

        if (!pages) {
            console.warn("No pages found in collections!");
            return { root: { name: "root", children: [], parent: null }, nodes: new Map(), flat: [] };
        }

        console.log("Pages to build: ", pages.length);
        const navGraph = buildNavigationGraph(pages, input);
        console.log(navGraph);
        return navGraph;
    });

    // Register (Paired) Shortcodes
    registerShortcodes(eleventy, nunjucksEnv, markdown);

    // Pass Through Copy
    eleventy.addPassthroughCopy({ [`${workspace}/${styles}/`] : `${styles}` });
    eleventy.addPassthroughCopy({ [`${workspace}/${scripts}/`] : `${scripts}` });
    eleventy.addPassthroughCopy({ [`${workspace}/${images}/`] : "img" });

    // Trigger Rebuild on JS and CSS changes
    eleventy.addWatchTarget(`./${workspace}/${scripts}`);
    eleventy.addWatchTarget(`./${workspace}/${styles}`);
    eleventy.addWatchTarget(`./${workspace}/lib`)

    eleventy.addGlobalData("layout", "base");

    return {
        dir: {
            input: `${workspace}/${input}`,
            output: output,
            data: `../${data}`,
            includes: `../${components}`,
            layouts: `../${layouts}`
        },

        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
    };
}