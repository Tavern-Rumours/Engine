/**
 * Builds a navigation-specific graph from the base content graph.
 *
 * The navigation graph is a filtered, sorted, and cloned subset of the
 * content graph. It excludes pages marked with `nav_exclude: true` in their
 * front matter, sorts siblings by `nav_order` (then alphabetically), and
 * exposes navigation-specific helpers for templates.
 *
 * Crucially, it operates on a *clone* of the content graph tree rather than
 * mutating it, so sorting and filtering here never affect the relation graph
 * or any other consumer of the original content graph.
 *
 * ─── Front-matter controls ───────────────────────────────────────────────────
 *
 *   nav_exclude: true     — removes the page from the navigation tree entirely
 *   nav_order: 1          — controls sort position among siblings (lower = first)
 *   nav_title: "Short"    — overrides the navigation label without changing
 *                           the article's actual title (set in contentGraph)
 *
 * ─── NavigationNode shape ────────────────────────────────────────────────────
 *
 *   {
 *     name:     string,             // display name for navigation
 *     url:      string,             // page URL
 *     page:     EleventyPage|null,  // raw Eleventy page object
 *     parent:   NavigationNode|null,
 *     children: NavigationNode[],
 *   }
 *
 *   Navigation nodes are intentionally lighter than content nodes — they carry
 *   only what templates need for rendering menus, breadcrumbs, and prev/next
 *   links. Relations and backlinks are not included.
 *
 * @param   {ContentGraph}    contentGraph - produced by buildContentGraph
 * @returns {NavigationGraph}
 *
 * @typedef {object} NavigationGraph
 * @property {NavigationNode}   root           - the root of the navigation tree
 * @property {NavigationNode[]} flat           - all navigation nodes in sorted order
 * @property {Function}         getPrevNext    - returns prev/next nodes for a given node
 * @property {Function}         getSiblings    - returns sibling nodes for a given node
 * @property {Function}         getNodeByStem  - passed through from contentGraph
 * @property {Function}         getActivePath  - returns the set of URLs on the path to a node
 * @property {Function}         getBreadcrumbs - returns the ancestor chain for a node
 */
export default function buildNavigationGraph(contentGraph) {
    const root = cloneNode(contentGraph.root);

    // Build flat array after cloning but before sorting, so the flat array
    // reflects the final sorted order once sortNodes runs.
    sortNodes(root);
    const flat = flatten(root);

    // Keyed by filePathStem, built from this graph's own (filtered, cloned)
    // nodes — NOT borrowed from contentGraph, so nav_exclude is respected
    // by any lookup done through this graph.
    const nodesByStem = new Map();
    for (const node of flat) {
        if (node.page?.filePathStem) nodesByStem.set(node.page.filePathStem, node);
    }

    return {
        root,
        flat,
        getPrevNext,
        getSiblings:   (node) => node.parent ? node.parent.children : [],
        getNodeByStem: (stem) => nodesByStem.get(stem),
        getActivePath,
        getBreadcrumbs,
    };
}


/**
 * Recursively clones a content node into a lightweight navigation node,
 * excluding any page marked with `nav_exclude: true`.
 *
 * Returns null for excluded pages so the caller can filter them out.
 * Child nodes that are excluded are also removed from the clone's children
 * array via the `.filter(Boolean)` call, so exclusion cascades correctly
 * when an entire subtree should be hidden.
 *
 * @param   {Node}               node    - content graph node to clone
 * @param   {NavigationNode|null} parent - the cloned parent node
 * @returns {NavigationNode|null}          cloned node, or null if excluded
 */
function cloneNode(node, parent = null) {
    if (node.page?.data?.nav_exclude) return null;

    const clone = {
        name:     node.name,
        url:      node.url,
        page:     node.page,
        parent,
        children: [],
    };

    clone.children = node.children
        .map(child => cloneNode(child, clone))
        .filter(Boolean);

    return clone;
}


/**
 * Recursively flattens the navigation tree into a depth-first ordered array,
 * excluding the root node itself.
 *
 * The resulting array is used for prev/next navigation — its order reflects
 * the sorted tree structure, so prev/next matches the visual order a reader
 * would encounter when moving through the site linearly.
 *
 * @param   {NavigationNode}   node    - the node to start from (typically root)
 * @param   {NavigationNode[]} [result] - accumulator, passed through recursion
 * @returns {NavigationNode[]}           flat ordered array of all navigation nodes
 */
function flatten(node, result = []) {
    for (const child of node.children) {
        result.push(child);
        flatten(child, result);
    }

    return result;
}


/**
 * Recursively sorts a node's children by `nav_order`, then alphabetically
 * by name for nodes that share the same order value or have no order set.
 *
 * Nodes without a `nav_order` value are sorted to the end (Infinity),
 * so explicitly ordered items always appear before unordered ones.
 *
 * Mutates the cloned navigation tree in place — the original content graph
 * is not affected.
 *
 * @param {NavigationNode} node - the node whose children should be sorted
 */
function sortNodes(node) {
    node.children.sort((a, b) => {
        const orderA = a.page?.data?.nav_order ?? Infinity;
        const orderB = b.page?.data?.nav_order ?? Infinity;

        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
    });

    node.children.forEach(sortNodes);
}


/**
 * Returns the previous and next nodes relative to the given node in the
 * flattened navigation order.
 *
 * Designed to be called as `graph.getPrevNext(graph, node)` from templates.
 * Either value is null when the node is at the start or end of the flat list.
 *
 * @param   {NavigationGraph} graph - the navigation graph (provides flat array)
 * @param   {NavigationNode}  node  - the current page's node
 * @returns {{ prev: NavigationNode|null, next: NavigationNode|null }}
 */
function getPrevNext(graph, node) {
    const index = graph.flat.indexOf(node);

    return {
        prev: graph.flat[index - 1] ?? null,
        next: graph.flat[index + 1] ?? null,
    };
}


/**
 * Returns the set of URLs that form the path from the site root to the
 * given node, inclusive.
 *
 * Used by templates to determine which navigation items are "active" —
 * i.e. the current page and all its ancestors. Checking `activePath.has(node.url)`
 * in a template will return true for the current page and every ancestor.
 *
 * @param   {NavigationNode} currentNode - the current page's node
 * @returns {Set<string>}                  set of URLs on the active path
 */
function getActivePath(currentNode) {
    const path = new Set();
    let node = currentNode;

    while (node) {
        path.add(node.url);
        node = node.parent;
    }

    return path;
}


/**
 * Returns the ancestor chain for the given node as an ordered array suitable
 * for rendering a breadcrumb trail, from the top-most ancestor down to the
 * current page.
 *
 * The root node ("/") is excluded since it is typically represented by a
 * "Home" link rendered separately in templates.
 *
 * Returns undefined when the node has no ancestors worth showing (i.e. it is
 * a direct child of the root). Templates should guard against this:
 *   {% set crumbs = getBreadcrumbs(node) %}
 *   {% if crumbs %}…{% endif %}
 *
 * @param   {NavigationNode}          currentNode - the current page's node
 * @returns {BreadcrumbItem[]|undefined}            ordered ancestor chain, or undefined
 *
 * @typedef {object} BreadcrumbItem
 * @property {string}              title - display name
 * @property {string}              url   - page URL
 * @property {EleventyPage|null}   page  - raw Eleventy page object
 */
function getBreadcrumbs(currentNode) {
    const breadcrumbs = [];
    let node = currentNode;

    while (node) {
        if (node.url !== "/") {
            breadcrumbs.push({
                title: node.name,
                url:   node.url,
                page:  node.page,
            });
        }
        node = node.parent;
    }

    if (breadcrumbs.length > 1) return breadcrumbs.reverse();
}
