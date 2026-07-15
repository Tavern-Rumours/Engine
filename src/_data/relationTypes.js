/**
 * relationTypes.js
 *
 * Central definitions for known relation types.
 * These act as defaults — any value can be overridden per-article in
 * front matter without touching this file.
 *
 * ─── Shorthand form ───────────────────────────────────────────────────────────
 *
 *   knows: "Knows"
 *
 *   A plain string sets the forward label only.
 *   The inverse key mirrors the relation type, the inverse label mirrors
 *   the forward label, and no pluralisation is applied.
 *   Use for symmetric relations where both sides share the same heading.
 *
 * ─── Full form ────────────────────────────────────────────────────────────────
 *
 *   region: {
 *     label:              "Located in",
 *     labelPlural:        "Located in",       // usually same for forward
 *     inverse:            "settlements",
 *     inverseLabel:       "Settlement",
 *     inverseLabelPlural: "Settlements",
 *   }
 *
 *   label              — heading when this article lists its own relations
 *   labelPlural        — heading when there are multiple (falls back to label)
 *   inverse            — the bucket key used on the target article's backlinks
 *   inverseLabel       — heading on the target's backlinks when count === 1
 *   inverseLabelPlural — heading on the target's backlinks when count  >  1
 *
 * ─── Front-matter override ────────────────────────────────────────────────────
 *
 *   Any field defined here can be overridden in front matter at either
 *   group level or per-target level. Only the fields you provide are
 *   overridden; everything else continues to come from this file.
 *
 *   relations:
 *     region:
 *       targets:
 *         - id: region-of-frisia
 *           inverseLabel: "Birthplace of"    # overrides inverseLabelPlural too
 *
 * ─── Adding new types ─────────────────────────────────────────────────────────
 *
 *   Any relation type used in front matter that is NOT listed here will
 *   still work — it falls back to a auto-generated label from the key name.
 *   Add an entry here whenever you want a polished label or asymmetric
 *   inverse without repeating yourself in every article.
 */

export default {

    // ── Geography ─────────────────────────────────────────────────────────────

    region: {
        label: "Located in",
        inverse: "subregion",
        inverseLabel: "Subregion",
        inverseLabelPlural: "Subregions",

        aggregate: ["ethnicity"],
    },

    landmark: {
        label: "Notable landmark",
        labelPlural: "Notable landmarks",
        inverse: "foundIn",
        inverseLabel: "Found in",
    },

    borders: {
        label: "Borders",
        inverse: "borders",
        inverseLabel: "Borders",
    },

    // Article type — used when type: settlement is set on an article
    settlement: {
        label: "Located in",
        inverse: "settlements",
        inverseLabel: "Settlement",
        inverseLabelPlural: "Settlements",
    },

    // Article type — used when type: building is set on an article
    building: {
        label: "Contains building",
        labelPlural: "Contains buildings",
        inverse: "buildings",
        inverseLabel: "Building",
        inverseLabelPlural: "Buildings",

        byTargetType: {
            owner: {
                label: "Owned by",
                labelPlural: "Owned by",
                inverse: "owns",
                inverseLabel: "Owns",
                inverseLabelPlural: "Owned by",
            },
        }
    },

    // ── Society & culture ─────────────────────────────────────────────────────

    traditions: {
        label: "Related tradition",
        labelPlural: "Related traditions",
        inverse: "practicedBy",
        inverseLabel: "Practiced by",
        inverseLabelPlural: "Practiced by",
    },

    religion: {
        label: "Follows religion",
        inverse: "followers",
        inverseLabel: "Follower",
        inverseLabelPlural: "Followers",
    },

    deity: {
        label: "Follows Deity",
        labelPlural: "Follows Deities",
        inverse: "followers",
        inverseLabel: "Follower",
        inverseLabelPlural: "Followers"
    },

    ruledBy: {
        label: "Ruled by",
        inverse: "rules",
        inverseLabel: "Rules",
    },

    // ── Trade & economy ───────────────────────────────────────────────────────

    tradePartners: {
        label: "Trade partner",
        labelPlural: "Trade partners",
        inverse: "tradePartners",
        inverseLabel: "Trade partner",
        inverseLabelPlural: "Trade partners",
    },

    famousFor: {
        label: "Famous for",
        inverse: "famousIn",
        inverseLabel: "Famous in",
    },

    // ── People ────────────────────────────────────────────────────────────────

    relationship: {
        label: "Related person",
        labelPlural: "Related people",
        inverse: "relationship",
        inverseLabel: "Related person",
        inverseLabelPlural: "Related people",
    },

    knows: {
        label: "Knows",
        inverse: "knows",
        inverseLabel: "Knows",
    },

    memberOf: {
        label: "Member of",
        inverse: "members",
        inverseLabel: "Member",
        inverseLabelPlural: "Members",
    },

    owner: {
        label: "Owned by",
        labelPlural: "Owned by",
        inverse: "owns",
        inverseLabel: "Owns",
        inverseLabelPlural: "Owned by",
    },

    character: {
        label: "Related To",
        labelPlural: "Related To",
        inverse: "relatedTo",
        inverseLabel: "Related To",
        inverseLabelPlural: "Related To",

        byTargetType: {
            specie: {
                label: "Specie",
                labelPlural: "Species",
                inverse: "characterSpecie",
                inverseLabel: "Important Character",
                inverseLabelPlural: "Important Characters",
                inverseHidden: true,
            }
        }
    },

    specie: {
        label: "Genetic Ancestor",
        labelPlural: "Genetic Ancestors",
        inverse: "descendantSpecie",
        inverseLabel: "Genetic Descendant",
        inverseLabelPlural: "Genetic Descendants",

        aggregate: [
            "ethnicity",
        ],
    },

    ethnicity: {
        label: "Parent Ethnicity",
        labelPlural: "Parent Ethnicities",
        inverse: "subethnicity",
        inverseLabel: "Subethnicity",
        inverseLabelPlural: "Subethnicities",

        // Edge-specific overrides — keyed by the TARGET's type
        byTargetType: {
            specie: {
                inverse: "ethnicity-specie",
                inverseLabel: "Ethnicity",
                inverseLabelPlural: "Ethnicities",
            },

            organisation: {
                label: "Related Organisation",
                labelPlural: "Related Organisations",
                inverse: "organisation-ethnicity",
                inverseLabel: "Related Ethnicity",
                inverseLabelPlural: "Related Ethnicities",
            },

            region: {
                label: "Found in Region",
                labelPlural: "Found in Regions",
                inverse: "ethnicGroups",
                inverseLabel: "Ethnic group present",
                inverseLabelPlural: "Ethnic groups present",
            },

            settlement: {
                label: "Found in Settlement",
                labelPlural: "Found in Settlements",
                inverse: "ethnicGroups",
                inverseLabel: "Ethnic group present",
                inverseLabelPlural: "Ethnic groups present",
            }
        },
    },

    condition: {
        label: "Related Condition",
        labelPlural: "Related Conditions",

        byTargetType: {
            specie: {
                label: "Affected Specie",
                labelPlural: "Affected Species",
                inverse: "affectedBy",
                inverseLabel: "Affected by",
            }
        },
    },

    // ── Conflict ──────────────────────────────────────────────────────────────

    enemies: {
        label: "Enemy",
        labelPlural: "Enemies",
        inverse: "enemies",
        inverseLabel: "Enemy",
        inverseLabelPlural: "Enemies",
    },

    allies: {
        label: "Ally",
        labelPlural: "Allies",
        inverse: "allies",
        inverseLabel: "Ally",
        inverseLabelPlural: "Allies",
    },

};
