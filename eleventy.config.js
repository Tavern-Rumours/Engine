// Imports
import fs from 'fs';
import { rm } from 'fs/promises';
import buildContentGraph from './lib/graphs/contentGraph.js';
import buildNavigationGraph from './lib/graphs/navigationGraph.js';
import buildRelationGraph from './lib/graphs/relationGraph.js';
import markdown from './lib/markdown.config.js';
import getNunjucksEnv from './lib/nunjucks.js';
import registerShortcodes from './lib/shortcodes/index.js';
import relationTypes from './src/_data/relationTypes.js';

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
    const theme = "base";
    const images = `${input}/img`;

    let contentGraph;
    let relationGraph;
    let initialRun = true;

    // Nunjuck Environment
    const nunjucksEnv = getNunjucksEnv(`${workspace}/${components}`);

    // Setting Libraries
    eleventy.setLibrary("md", markdown);
    eleventy.setLibrary("njk", nunjucksEnv);

    // Creating a ContentGraph
    eleventy.addCollection("contentGraph", (collections) => {
        const pages = collections.all ?? collections.items;

        if (!pages) {
            console.warn("No pages found in collections!");
            return { 
                root: {
                    name: "root",
                    children: [],
                    parent: null
                },
                nodes: new Map(),
                flat: []
            };
        }

        contentGraph = buildContentGraph(pages);
        return contentGraph;
    });

    // Creating a NavigationGraph based on ContentGraph
    eleventy.addCollection("navGraph", () => {
        return buildNavigationGraph(contentGraph);
    });

    // Enrich ContentGraph with Relations into RelationGraph
    eleventy.addCollection("relationGraph", () => {
        relationGraph = buildRelationGraph(contentGraph, relationTypes);
        return relationGraph;
    })

    // Filters
    eleventy.addFilter("getRelations", (graph, stem) => {
        const node = graph.getNodeByStem(stem);

        const hasRelations = Object.keys(node.relations).length !== 0;
        const hasBacklinks = Object.keys(node.backlinks).length !== 0;

        if (hasRelations || hasBacklinks) return node;
        else return null;
    });

    eleventy.addFilter("getAncestors", (graph, stem) => {
        return graph.getActivePath(graph.getNodeByStem(stem))
    });

    eleventy.addFilter("getBreadcrumbs", (graph, stem) => {
        return graph.getBreadcrumbs(graph.getNodeByStem(stem))
    });

    eleventy.addFilter("isArray", value => Array.isArray(value));

    eleventy.addFilter("isObject", value => value !== null
        && typeof value === "object"
        && !Array.isArray(value)
    );

    // Register (Paired) Shortcodes
    registerShortcodes(eleventy, nunjucksEnv, markdown);

    // Pass Through Copy
    eleventy.addPassthroughCopy({ [`${workspace}/${styles}/${theme}`] : `${styles}` });
    eleventy.addPassthroughCopy({ [`${workspace}/${scripts}/`] : `${scripts}` });
    eleventy.addPassthroughCopy({ [`${workspace}/${images}/`] : "img" });

    // Trigger Rebuild on JS and CSS changes
    eleventy.addWatchTarget(`./${workspace}/${scripts}`);
    eleventy.addWatchTarget(`./${workspace}/${styles}`);
    eleventy.addWatchTarget(`./${workspace}/lib`)

    // Apply base.njk as default layout
    eleventy.addGlobalData("layout", "base");

    eleventy.on("eleventy.before", async ({ dir, runMode }) => {
        if (runMode === "build" || initialRun) await rm(dir.output, { recursive: true, force: true });
        
        initialRun = false;
    })

    eleventy.on("eleventy.after", async () => {
        if (relationGraph.stubs.length) {
            let stubArticles = `[RelationGraph] Stub articles (${relationGraph.stubs.length}):\r\n`;
            relationGraph.stubs.forEach(s => stubArticles = stubArticles + `  - ${s.name}\r\n`);

            console.log(stubArticles);
            fs.writeFileSync('./stubArticles.txt', stubArticles);
        }
    })

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
