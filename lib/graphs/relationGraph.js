// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Converts a camelCase key or hyphen/underscore-separated slug into a
 * human-readable label with a capitalised first word.
 *
 * Used as a last-resort fallback when no label is defined in the definitions
 * file or front matter, so authors always see something readable rather than
 * a raw key.
 *
 * @param   {string} key  - e.g. "tradePartners", "region_of-test"
 * @returns {string}        e.g. "Trade partners",  "Region of test"
 */
function toLabel(key) {
    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]/g, " ")
        .replace(/^\w/, c => c.toUpperCase());
}


/**
 * Normalises a type string so it can be used as a consistent lookup key
 * into the definitions map, regardless of how the author wrote it.
 *
 * Supports spaces, hyphens, underscores, and any capitalisation.
 * Returns null when the input is falsy so callers can use it directly
 * in a conditional without an extra null-check.
 *
 * @param   {string|null} key  - e.g. "Building", "sea-port", "SEA PORT"
 * @returns {string|null}        e.g. "building",  "seaPort",  "seaPort"
 */
function normaliseTypeKey(key) {
    if (!key) return null;
    return key
        .toLowerCase()
        .replace(/[-_\s]+(\w)/g, (_, c) => c.toUpperCase());
}


/**
 * Produces a direction-agnostic key for a pair of nodes and a relation type,
 * used to detect and deduplicate bidirectional edge definitions.
 *
 * Sorting the IDs alphabetically means the key is identical whether Article A
 * defines a relation to Article B, or Article B defines one back to Article A.
 * The relation type is included so two different relation types between the
 * same pair of articles produce separate edges.
 *
 * @param   {string} idA          - ID of one node
 * @param   {string} idB          - ID of the other node
 * @param   {string} relationType - e.g. "region", "knows"
 * @returns {string}                e.g. "article-a::article-b::region"
 */
function canonicalEdgeKey(idA, idB, relationType) {
    return [...[idA, idB].sort(), relationType].join("::");
}


/**
 * Merges front-matter metadata from the current article into an already-
 * registered edge, filling any gaps the first article left without overwriting
 * values that are already set.
 *
 * Called when both articles in a relationship define the same relation,
 * i.e. when the edge key is already present in the edgeRegistry.
 *
 * The "own" side is the link pointing away from the current node;
 * the "other" side is the link pointing back toward it.
 *
 * @param {object} edge          - EdgeRecord from the edgeRegistry
 * @param {object} target        - Normalised TargetDescriptor from front matter
 * @param {string} currentNodeId - ID of the node currently being processed
 */
function mergeEdge(edge, target, currentNodeId) {
    const isSource  = edge.source.id === currentNodeId;
    const ownLink   = isSource ? edge.forwardLink : edge.inverseLink;
    const otherLink = isSource ? edge.inverseLink : edge.forwardLink;

    ownLink.label           ??= target.label;
    ownLink.sentiment       ??= target.sentiment;
    ownLink.description     ??= target.description;

    otherLink.label         ??= target.inverseLabel;
    otherLink.description   ??= target.inverseDescription;
}


/**
 * Ensures a relation or backlink bucket exists on a node's collection.
 * Does nothing if the bucket is already present, so the first definition
 * of a bucket always wins and subsequent calls don't overwrite it.
 *
 * Both node.relations and node.backlinks use the same bucket shape:
 *   { label: string, labelPlural: string, nodes: LinkObject[] }
 *
 * @param {object} collection  - node.relations or node.backlinks
 * @param {string} key         - bucket key, e.g. "settlements", "buildings"
 * @param {string} label       - heading when the bucket has one entry
 * @param {string} labelPlural - heading when the bucket has multiple entries
 */
function ensureBucket(collection, key, label, labelPlural, hidden = false) {
    if (!collection[key]) {
        collection[key] = {
            label,
            labelPlural: labelPlural ?? label,
            hidden,
            nodes: [],
        };
    }
}


// ─── Normalisation ────────────────────────────────────────────────────────────

/**
 * Normalises a single entry from the definitions file into a consistent object
 * with all fields guaranteed to be present.
 *
 * Supports two authoring forms:
 *   - Shorthand string:  "Knows"  (symmetric, label only)
 *   - Full object:       { label, inverse, inverseLabel, … }
 *
 * Any field not provided falls back to a value derived from the relation type
 * key itself, so the result is always complete.
 *
 * Returns null when no definition is provided, allowing callers to fall
 * through to the next level of the priority chain.
 *
 * @param   {string}        relationType - the key from the definitions file
 * @param   {string|object} definition   - raw entry from relationTypes.js
 * @returns {object|null}                  normalised definition, or null
 */
function normaliseDefinition(relationType, definition) {
    if (!definition) return null;

    if (typeof definition === "string") {
        return {
            label:              definition,
            labelPlural:        definition,
            inverse:            relationType,
            inverseLabel:       definition,
            inverseLabelPlural: definition,
        };
    }

    const label       = definition.label        ?? toLabel(relationType);
    const inverse     = definition.inverse      ?? relationType;
    const inverseLabel = definition.inverseLabel ?? toLabel(inverse);

    return {
        label,
        labelPlural:        definition.labelPlural        ?? label,
        inverse,
        inverseLabel,
        inverseLabelPlural: definition.inverseLabelPlural ?? inverseLabel,
    };
}


/**
 * Normalises a single relation target from front matter into a consistent
 * TargetDescriptor object with all fields guaranteed to be present.
 *
 * Supports two authoring forms:
 *   - Bare string:  "Vale of Embers"   (title or ID, no metadata)
 *   - Object:       { id, type, label, sentiment, … }
 *
 * @param   {string|object} t  - raw target value from front matter
 * @returns {TargetDescriptor}   normalised descriptor
 *
 * @typedef {object} TargetDescriptor
 * @property {string}      id                - title or ID of the target article
 * @property {string|null} type              - optional source type override
 * @property {string|null} label             - label for the link on this page
 * @property {string|null} inverseLabel      - label for the backlink on the target page
 * @property {string|null} sentiment         - e.g. "positive", "negative"
 * @property {string|null} description       - flavour text on this page
 * @property {string|null} inverseDescription - flavour text on the target page
 */
function normaliseTarget(t) {
    if (typeof t === "string") {
        return {
            id:                 t,
            type:               null,
            label:              null,
            inverseLabel:       null,
            sentiment:          null,
            description:        null,
            inverseDescription: null,
            inverseHidden:      null,
        };
    }

    return {
        id:                 t.id,
        type:               t.type               ?? null,
        label:              t.label              ?? null,
        inverseLabel:       t.inverseLabel       ?? null,
        sentiment:          t.sentiment          ?? null,
        description:        t.description        ?? null,
        inverseDescription: t.inverseDescription ?? null,
        inverseHidden:      t.inverseHidden      ?? null,
    };
}


/**
 * Normalises a raw front-matter relation value into a RelationDescriptor,
 * resolving labels and keys by walking the full priority chain:
 *
 *   per-edge override (byTargetType)
 *     → base definition from relationTypes.js
 *       → auto-generated from the key name
 *
 * The edge override is determined by the source article's type combined with
 * the relation key. For example, an article with `type: ethnicity` defining
 * a `region` relation will look up definitions.ethnicity.byTargetType.region.
 *
 * Note: because this runs before individual targets are resolved, it uses the
 * relation key itself (e.g. "region") as a heuristic for the target type.
 * This is an intentional trade-off — it means forward labels are a group-level
 * approximation, while inverse labels (computed per-target in the main loop)
 * have access to the real target type.
 *
 * Supports three front-matter forms:
 *   - Bare string:  "Vale of Embers"
 *   - Array:        ["Vale of Embers", "Ashfen"]
 *   - Object:       { targets, type, label, inverse, … }
 *
 * @param   {string}        relationType - the front-matter key, e.g. "region"
 * @param   {*}             value        - raw front-matter value
 * @param   {object}        definitions  - the full definitions map
 * @param   {ContentNode}   sourceNode   - the article currently being processed
 * @returns {RelationDescriptor}
 *
 * @typedef {object} RelationDescriptor
 * @property {string}             label
 * @property {string}             labelPlural
 * @property {string}             inverse
 * @property {string}             inverseLabel
 * @property {string}             inverseLabelPlural
 * @property {boolean}            inverseHidden
 * @property {string|null}        type
 * @property {TargetDescriptor[]} targets
 */
function normaliseRelation(relationType, value, definitions, sourceNode) {
    const definition = normaliseDefinition(relationType, definitions?.[relationType]);

    // Determine the source type — group-level `type` in front matter wins
    // over the article-level `type`, since it's more specific.
    const groupType  = (value && typeof value === "object" && !Array.isArray(value))
        ? value.type
        : null;
    const sourceType = normaliseTypeKey(groupType ?? sourceNode?.page?.data?.type ?? null);

    // Look up an edge-specific override from the source type's byTargetType map,
    // using the relation key as a proxy for the target type.
    const edgeOverride = sourceType
        ? definitions?.[sourceType]?.byTargetType?.[relationType]
        : null;

    // Every label/key walks the same three-step chain:
    // edge override → base definition → auto-generated fallback.
    const fallbackLabel              = edgeOverride?.label              ?? definition?.label              ?? toLabel(relationType);
    const fallbackLabelPlural        = edgeOverride?.labelPlural        ?? definition?.labelPlural        ?? fallbackLabel;
    const fallbackInverse            = edgeOverride?.inverse            ?? definition?.inverse            ?? relationType;
    const fallbackInverseLabel       = edgeOverride?.inverseLabel       ?? definition?.inverseLabel       ?? toLabel(fallbackInverse);
    const fallbackInverseLabelPlural = edgeOverride?.inverseLabelPlural ?? definition?.inverseLabelPlural ?? fallbackInverseLabel;
    const fallbackInverseHidden      = edgeOverride?.inverseHidden      ?? definition?.inverseHidden      ?? false;

    const defaults = {
        label:              fallbackLabel,
        labelPlural:        fallbackLabelPlural,
        inverse:            fallbackInverse,
        inverseLabel:       fallbackInverseLabel,
        inverseLabelPlural: fallbackInverseLabelPlural,
        inverseHidden:      fallbackInverseHidden,
    };

    if (typeof value === "string") return { ...defaults, type: null, targets: [normaliseTarget(value)] };
    if (Array.isArray(value))      return { ...defaults, type: null, targets: value.map(normaliseTarget) };

    return {
        label:              value.label              ?? fallbackLabel,
        labelPlural:        value.labelPlural        ?? fallbackLabelPlural,
        inverse:            value.inverse            ?? fallbackInverse,
        inverseLabel:       value.inverseLabel       ?? fallbackInverseLabel,
        inverseLabelPlural: value.inverseLabelPlural ?? fallbackInverseLabelPlural,
        inverseHidden:      value.inverseHidden      ?? fallbackInverseHidden,
        type:               value.type               ?? null,
        targets: typeof value.targets === "string"
            ? [normaliseTarget(value.targets)]
            : (value.targets ?? []).map(normaliseTarget),
    };
}


// ─── Graph Resolution ─────────────────────────────────────────────────────────

/**
 * Returns the existing ContentNode for a given target reference, or creates
 * and registers a lightweight stub node if no matching article exists yet.
 *
 * Resolution order:
 *   1. Exact match by article ID (the filename slug or front-matter `id`)
 *   2. Match by article title via the nodesByTitle map
 *   3. Create a stub node and register it for future lookups
 *
 * Stub nodes are full graph participants — they accumulate backlinks just like
 * real nodes — but have url: null and no page data. Templates use the absent
 * URL to render them as plain text rather than links.
 *
 * Stubs are added to contentGraph.stubs so the build log can report which
 * articles are referenced but not yet written.
 *
 * @param   {ContentGraph} contentGraph - the graph produced by buildContentGraph
 * @param   {string}       target       - article title or ID from front matter
 * @returns {ContentNode}                 existing node or newly created stub
 */
function resolveOrCreateStub(contentGraph, target) {
    const byId = contentGraph.nodesById.get(target);
    if (byId) return byId;

    const byTitle = contentGraph.nodesByTitle?.get(target);
    if (byTitle) return byTitle;

    const stub = {
        id:        target,
        name:      toLabel(target),
        url:       null,
        page:      null,
        relations: {},
        backlinks: {},
    };

    contentGraph.nodesById.set(target, stub);
    contentGraph.stubs.push(stub);

    console.info(`[RelationGraph] Stub created for "${toLabel(target)}"`);

    return stub;
}


/**
 * Resolves the effective type definition for a specific edge, accounting for
 * both the source article's type and the target article's type.
 *
 * This is the per-target complement to the group-level edge override computed
 * in normaliseRelation. Where normaliseRelation uses the relation key as a
 * heuristic for the target type, this function has access to the resolved
 * target node and can use its actual declared type — or fall back to the
 * relation key for stubs that have no page data yet.
 *
 * Priority chain for source type:
 *   per-target `type` → group-level `type` → article front matter `type`
 *
 * Priority chain for target type:
 *   target article's `type` → relation key (stub heuristic)
 *
 * Returns null when no source type can be determined, which causes the caller
 * to fall back to the base relation definition.
 *
 * @param   {TargetDescriptor} target       - normalised target from front matter
 * @param   {RelationDescriptor} relation   - normalised relation descriptor
 * @param   {ContentNode}  sourceNode       - the article defining the relation
 * @param   {ContentNode}  targetNode       - the resolved target article or stub
 * @param   {string}       relationType     - the relation key, e.g. "region"
 * @param   {object}       definitions      - the full definitions map
 * @returns {object|null}                     normalised definition with edge
 *                                            override applied, or null
 */
function resolveTypeDefinition(target, relation, sourceNode, targetNode, relationType, definitions) {
    const sourceType = normaliseTypeKey(
        target.type ?? relation.type ?? sourceNode.page?.data?.type ?? null
    );
    if (!sourceType) return null;

    const definition = definitions?.[sourceType];
    if (!definition) return null;

    // Use the target's declared type when available; fall back to the relation
    // key as a reasonable guess for stubs that have no page data yet.
    const targetType   = normaliseTypeKey(targetNode.page?.data?.type ?? relationType ?? null);
    const edgeOverride = targetType ? definition.byTargetType?.[targetType] : null;

    return normaliseDefinition(sourceType, { ...definition, ...edgeOverride });
}

// ─── Aggregate Graph ─────────────────────────────────────────────────────────

/**
 * Post-processing pass that propagates specific backlink types up a
 * parent-child hierarchy, so parent nodes automatically inherit relations
 * from all their descendants.
 *
 * Must be called after buildRelationGraph, since it reads backlinks that
 * were computed during that pass.
 *
 * Which relation types propagate, and which backlink types they collect,
 * is configured via the `aggregate` array in relationTypes.js:
 *
 *   region: {
 *     inverse:   "subregion",
 *     aggregate: ["religion", "ethnicity"],
 *   }
 *
 * This tells the system: "climb down through subregions and pull up any
 * religion and ethnicity backlinks, recursively."
 *
 * Aggregated links are merged into the same backlink buckets as directly
 * defined ones, so templates require no special handling.
 *
 * @param   {ContentGraph} relationGraph - the enriched graph from buildRelationGraph
 * @param   {object}       definitions   - relation type definitions from relationTypes.js
 * @returns {ContentGraph}                 the same graph, mutated in place
 */
function aggregateRelationGraph(relationGraph, definitions = {}) {

    for (const [relationType, definition] of Object.entries(definitions)) {

        // Only process relation types that have aggregation configured
        if (!definition.aggregate?.length) continue;

        // The inverse key tells us where children are stored in a node's backlinks.
        // For region (inverse: "subregion"), children live in node.backlinks.subregion.
        const childKey       = definition.inverse ?? relationType;
        const aggregateTypes = definition.aggregate.map(normaliseTypeKey);

        for (const node of relationGraph.flat) {

            // Skip nodes that have no children via this relation
            if (!node.backlinks[childKey]?.nodes?.length) continue;

            // Collect all aggregatable links from the full descendant subtree.
            // The visited Set is seeded with this node's ID to prevent cycles
            // in the unlikely case of circular subregion definitions.
            mergeCollections(
                node.backlinks,
                collectFromDescendants(
                    node,
                    childKey,
                    aggregateTypes,
                    new Set([node.id])
                )
            );
        }
    }

    return relationGraph;
}

/**
 * Recursively collects backlinks of the specified types from a node's
 * full descendant subtree.
 *
 * Walks the tree via the inverse bucket (e.g. backlinks.subregion),
 * inspects each descendant's backlinks, and returns any links whose source
 * article type matches the aggregate list.
 *
 * Results are keyed by backlink bucket key so the caller can merge them
 * into the correct bucket on the ancestor node, preserving each bucket's
 * label and labelPlural.
 *
 * @param   {ContentNode} node           - the node whose descendants to search
 * @param   {string}      childKey       - backlink bucket key for child lookup, e.g. "subregion"
 * @param   {string[]}    aggregateTypes - normalised type keys to collect, e.g. ["religion"]
 * @param   {Set<string>} visited        - node IDs already processed (cycle guard)
 * @returns {object}                       map of bucketKey → { label, labelPlural, nodes }
 */
function collectFromDescendants(node, childKey, aggregateTypes, visited) {
    const result   = {};
    const children = node.backlinks[childKey]?.nodes ?? [];

    for (const childLink of children) {
        const child = childLink.node;

        // Cycle guard — also naturally handles stubs, which have no backlinks
        if (visited.has(child.id)) continue;
        visited.add(child.id);

        // Scan all backlink buckets on this child and collect matching links
        for (const [bucketKey, bucket] of Object.entries(child.backlinks)) {
            const matching = bucket.nodes.filter(link => {
                const type = normaliseTypeKey(link.node.page?.data?.type ?? null);
                return type && aggregateTypes.includes(type);
            });

            if (matching.length) {
                mergeCollections(result, {
                    [bucketKey]: {
                        label:       bucket.label,
                        labelPlural: bucket.labelPlural,
                        nodes:       matching,
                    },
                });
            }
        }

        // Recurse into this child's own descendants and merge the results up
        mergeCollections(result, collectFromDescendants(
            child,
            childKey,
            aggregateTypes,
            visited
        ));
    }

    return result;
}

/**
 * Merges all buckets from a source collection into a target collection,
 * creating buckets on the target as needed and deduplicating entries by
 * node ID so the same article never appears twice in one bucket.
 *
 * Used in two contexts:
 *   - Merging collected descendants into a node's backlinks (in aggregateRelationGraph)
 *   - Merging intermediate results during recursive collection (in collectFromDescendants)
 *
 * Both target and source share the same bucket shape:
 *   { [key]: { label, labelPlural, nodes: LinkObject[] } }
 *
 * @param {object} target - the collection to merge into (mutated in place)
 * @param {object} source - the collection to merge from
 */
function mergeCollections(target, source) {
    for (const [bucketKey, sourceBucket] of Object.entries(source)) {
        if (!target[bucketKey]) {
            target[bucketKey] = {
                label:       sourceBucket.label,
                labelPlural: sourceBucket.labelPlural,
                nodes:       [],
            };
        }

        const existingIds = new Set(target[bucketKey].nodes.map(link => link.node.id));
        for (const link of sourceBucket.nodes) {
            if (!existingIds.has(link.node.id)) {
                target[bucketKey].nodes.push(link);
                existingIds.add(link.node.id);
            }
        }
    }
}


// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Enriches a contentGraph with relations and their automatic backlinks,
 * derived entirely from front-matter data in each article.
 *
 * For every article in the graph, each relation defined in its front matter
 * produces two things:
 *   1. A forward link on the source article's node.relations
 *   2. A backlink on the target article's node.backlinks
 *
 * Both collections share the same bucket shape so templates can iterate
 * them identically:
 *   { [key]: { label, labelPlural, nodes: LinkObject[] } }
 *
 * A LinkObject is:
 *   { node: ContentNode, label, sentiment, description }
 *
 * Bidirectional deduplication is handled via an edge registry keyed by a
 * canonical (direction-agnostic) edge key. When both articles define the same
 * relation, the second definition merges into the existing edge rather than
 * creating a duplicate.
 *
 * @param   {ContentGraph} contentGraph  - produced by buildContentGraph
 * @param   {object}       [definitions] - relation type definitions from relationTypes.js
 * @returns {ContentGraph}                 the same graph, mutated in place
 */
export default function buildRelationGraph(contentGraph, definitions = {}) {

    /**
     * Tracks every edge written to the graph during this build pass.
     * Keyed by canonicalEdgeKey so bidirectional definitions resolve
     * to the same entry regardless of which article is processed first.
     *
     * EdgeRecord shape:
     * {
     *   source:      ContentNode,
     *   target:      ContentNode,
     *   forwardLink: LinkObject,   // source → target
     *   inverseLink: LinkObject,   // target → source
     * }
     */
    const edgeRegistry = new Map();

    for (const node of contentGraph.flat) {
        const rawRelations = node.page?.data?.relations;
        if (!rawRelations) continue;

        for (const [relationType, relationValues] of Object.entries(rawRelations)) {
            const relation = normaliseRelation(relationType, relationValues, definitions, node);

            ensureBucket(node.relations, relationType, relation.label, relation.labelPlural);

            for (const target of relation.targets) {
                const targetNode = resolveOrCreateStub(contentGraph, target.id);
                const edgeKey    = canonicalEdgeKey(node.id, targetNode.id, relationType);

                if (edgeRegistry.has(edgeKey)) {
                    mergeEdge(edgeRegistry.get(edgeKey), target, node.id);
                    continue;
                }

                const forwardLink = {
                    node:        targetNode,
                    label:       target.label       ?? null,
                    sentiment:   target.sentiment   ?? null,
                    description: target.description ?? null,
                };

                const inverseLink = {
                    node:        node,
                    label:       target.inverseLabel        ?? null,
                    sentiment:   target.sentiment           ?? null,
                    description: target.inverseDescription  ?? null,
                };

                edgeRegistry.set(edgeKey, {
                    source: node,
                    target: targetNode,
                    forwardLink,
                    inverseLink,
                });

                node.relations[relationType].nodes.push(forwardLink);

                // Resolve the inverse bucket key and labels using the full
                // type priority chain, then push the backlink onto the target.
                const type = resolveTypeDefinition(
                    target, relation, node, targetNode, relationType, definitions
                );

                const inverseKey         = type?.inverse            ?? relation.inverse;
                const inverseLabel       = target.inverseLabel      ?? type?.inverseLabel       ?? relation.inverseLabel;
                const inverseLabelPlural = target.inverseLabelPlural ?? type?.inverseLabelPlural ?? relation.inverseLabelPlural;
                const inverseHidden      = target.inverseHidden ?? type?.inverseHidden ?? relation.inverseHidden;

                ensureBucket(targetNode.backlinks, inverseKey, inverseLabel, inverseLabelPlural, inverseHidden);
                targetNode.backlinks[inverseKey].nodes.push(inverseLink);
            }
        }
    }

    return aggregateRelationGraph(contentGraph, definitions)
}
