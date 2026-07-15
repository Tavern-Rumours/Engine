/**
 * Builds the base content graph from Eleventy's page collection.
 *
 * The graph is a tree that mirrors the file-system structure of your content,
 * enriched with lookup maps for efficient access by path, ID, and title.
 * It serves as the foundation for all other graphs — the navigation graph
 * and relation graph both consume and enrich this structure.
 *
 * ─── Node shape ──────────────────────────────────────────────────────────────
 *
 *   Every node in the graph has the following shape:
 *
 *   {
 *     id:        string,       // front-matter `id`, fallback to fileSlug
 *     name:      string,       // front-matter `nav_title` or `title`, fallback to path segment
 *     url:       string,       // the page's URL as Eleventy resolves it
 *     parent:    Node | null,  // the parent node in the tree, null for root
 *     children:  Node[],       // direct child nodes
 *     relations: {},           // populated later by buildRelationGraph
 *     backlinks: {},           // populated later by buildRelationGraph
 *     page:      EleventyPage | null,  // the raw Eleventy page object, null for structural nodes
 *   }
 *
 * ─── Structural nodes ────────────────────────────────────────────────────────
 *
 *   A structural node is created for any path segment that exists in the
 *   file-system hierarchy but has no corresponding Eleventy page of its own —
 *   for example, a directory without an index file. These nodes have
 *   page: null and id: null until a real page is found at that path.
 *
 * ─── Lookup maps ─────────────────────────────────────────────────────────────
 *
 *   nodes        — keyed by URL path and filePathStem, used for tree assembly
 *   nodesById    — keyed by article ID, used by buildRelationGraph
 *   nodesByTitle — keyed by display name, used for title-based relation resolution
 *   flat         — ordered array of all real page nodes, used for iteration
 *   stubs        — initially empty; populated by buildRelationGraph when a
 *                  relation targets an article that does not yet exist
 *
 * @param   {EleventyPage[]} pages - the full Eleventy page collection
 * @returns {ContentGraph}
 *
 * @typedef {object} ContentGraph
 * @property {Node}            root           - the root node at "/"
 * @property {Map<string,Node>} nodes         - lookup by URL path or filePathStem
 * @property {Map<string,Node>} nodesById     - lookup by article ID
 * @property {Map<string,Node>} nodesByTitle  - lookup by display name
 * @property {Node[]}           flat          - all real page nodes in discovery order
 * @property {Node[]}           stubs         - stub nodes added by buildRelationGraph
 * @property {Function}         getNodeByStem - shorthand for nodes.get(stem)
 */
export default function buildContentGraph(pages) {

    /**
     * The root node represents the site root ("/").
     * It is the only node with no parent and is never added to `flat`
     * since it does not correspond to a real page.
     */
    const root = {
        name:      "home",
        url:       "/",
        children:  [],
        parent:    null,
        relations: {},
        backlinks: {},
    };

    /** Keyed by URL path and filePathStem — used during tree assembly */
    const nodes        = new Map();
    /** Keyed by article ID (front-matter `id` or fileSlug) */
    const nodesById    = new Map();
    /** Keyed by display name (nav_title or title) — used for title-based relation resolution */
    const nodesByTitle = new Map();
    /** All real page nodes in the order Eleventy discovered them */
    const flat         = [];

    nodes.set("/", root);

    for (const item of pages) {
        
        // Break the file path into segments, e.g.
        // "/regions/vale-of-embers/index" → ["regions", "vale-of-embers"]
        const parts = item.page.filePathStem
            .replace(/^\/+/, "")
            .split("/")
            .filter(Boolean);

        let parent      = root;
        let currentPath = "/";

        for (const part of parts) {
            // Index files represent the directory itself, not a child node
            if (part === "index") continue;

            currentPath = currentPath === "/" ? `/${part}` : `${currentPath}/${part}`;

            // Capitalise the first letter for a readable default name
            const name = String(part).charAt(0).toUpperCase() + String(part).slice(1);

            // Create a structural placeholder if this path hasn't been seen yet.
            // It will be hydrated with real page data when the matching page
            // is processed below.
            if (!nodes.has(currentPath)) {
                const node = {
                    id:        null,
                    name,
                    url:       currentPath,
                    parent,
                    children:  [],
                    relations: {},
                    backlinks: {},
                    page:      null,
                };

                parent.children.push(node);
                nodes.set(currentPath, node);
            }

            parent = nodes.get(currentPath);
        }

        // Hydrate the node at this path with the real page data.
        // nav_title takes priority over title for the display name,
        // allowing authors to use a shorter name in navigation without
        // changing the article's actual title.
        parent.id   = item.data.id   || item.fileSlug;
        parent.name = item.data.nav_title || item.data.title || parent.name;
        parent.url  = item.page.url;
        parent.page = item;

        // Register under both the filePathStem and the URL for flexible lookup
        nodes.set(item.page.filePathStem, parent);
        nodesById.set(parent.id, parent);

        if (nodesByTitle.has(parent.name)) {
            const existing = nodesByTitle.get(parent.name);
            console.warn(`[ContentGraph] Duplicate title "${parent.name}" — "${existing.url}" and "${parent.url}" both use this name. Title-based relation lookups will resolve to "${parent.url}".`);
        }
        
        nodesByTitle.set(parent.name, parent);
        flat.push(parent);
    }

    return {
        root,
        nodes,
        nodesById,
        nodesByTitle,
        flat,
        /** Populated by buildRelationGraph when a relation targets a non-existent article */
        stubs:         [],
        getNodeByStem: (stem) => nodes.get(stem),
    };
}
