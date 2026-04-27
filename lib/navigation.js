export default function buildNavigationGraph(pages) {

    const root = {
        name: "home",
        url: "/",
        children: [],
        parent: null,
    };

    const nodes = new Map();
    const flat = [];

    nodes.set("/", root);

    for (const item of pages) {
        if (item.data.nav_exclude) continue;

        const parts = item.page.filePathStem
            .replace(/^\/+/, "")
            .split("/")
            .filter(Boolean);

        let parent = root;
        let currentPath = "/";

        for (const part of parts) {
            if (part === "index") continue;

            currentPath = currentPath === "/" ? `/${part}` : `${currentPath}/${part}`;
            const name = String(part).charAt(0).toUpperCase() + String(part).slice(1);

            if (!nodes.has(currentPath)) {
                const node = {
                    name: name,
                    url: currentPath,
                    parent,
                    children: [],
                    page: null,
                }

                parent.children.push(node);
                nodes.set(currentPath, node);
            }

            parent = nodes.get(currentPath);
        }

        parent.name = item.data.title || parent.name;
        parent.url = item.page.url;
        parent.page = item;
        
        nodes.set(item.page.filePathStem, parent);
        flat.push(parent);
    }

    sortNodes(root);

    return { 
        root,
        nodes,
        flat,
        getPrevNext,
        getSiblings: (node) => node.parent ? node.parent.children : [],
        getNodeByStem: (stem) => nodes.get(stem),
        getActivePath,
        getBreadcrumbs,
    };
}

function sortNodes(node) {
    node.children.sort((a, b) => {
        const orderA = a.page?.data?.nav_order ?? Infinity;
        const orderB = b.page?.data?.nav_order ?? Infinity;

        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
    });

    node.children.forEach(sortNodes);
}

function getPrevNext(graph, node) {
    const index = graph.flat.indexOf(node);

    return {
        prev: graph.flat[index - 1] ?? null,
        next: graph.flat[index + 1] ?? null
    };
}

function getActivePath(currentNode) {
    const path = new Set();
    let node = currentNode;

    while (node) {
        path.add(node.url);
        node = node.parent;
    }

    return path;
}

function getBreadcrumbs(currentNode) {
    const breadcrumbs = [];
    let node = currentNode;

    while (node) {
        const breadcrumb = {
            title: node.name,
            url: node.url,
        };
        if (node.url !== "/") breadcrumbs.push(breadcrumb);
        node = node.parent;
    };

    if (breadcrumbs.length > 1) return breadcrumbs.reverse();
}