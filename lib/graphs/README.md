# Relations — Author Guide

This guide explains how to define relations between articles using front matter.
No template code is needed — the system handles linking, backlinks, labels,
pluralisation, and stub articles automatically.

---

## The basics

Relations are defined in the `relations` block of any article's front matter.
Each key is a **relation type** and each value points to one or more other
articles by their title or ID.

```yaml
---
title: Ashfen
relations:
  region: Vale of Embers
---
```

This does two things automatically:

1. Ashfen gets a **"Located in"** section linking to Vale of Embers.
2. Vale of Embers gets a **"Settlements"** backlink pointing back to Ashfen.

Both the label and the backlink come from `relationTypes.js`. You never have
to write them yourself unless you want something different.

---

## Referencing other articles

You can reference any article by its **title** or its **ID** (the filename
without the extension). Titles are case-insensitive.

```yaml
relations:
  region: Vale of Embers    # by title
  region: vale-of-embers    # by ID — identical result
  region: VALE OF EMBERS    # also fine
```

---

## Targeting multiple articles

Pass several values as an array like this:

```yaml
relations:
  tradePartners: [Port of Cael, Iron Reach, Ashfen]
```

Or like this:
```yaml
relations:
  tradePartners:
    - Port of Cael
    - Iron Reach
    - Ashfen
```

All three receive a **"Trade partner"** backlink. The heading on this article
reads **"Trade partners"** (plural) automatically. Singular/plural switching
is defined per type in `relationTypes.js`.

---

## Article type

Declare `type` once in an article's front matter to tell the system what kind
of thing this article is. Every relation it defines will use this to categorise
its backlinks on the target — no extra configuration needed per relation.

```yaml
---
title: The Rusty Anchor
type: building
relations:
  region: Vale of Embers     # Vale of Embers gets a "Buildings" backlink
  settlement: Ashfen         # Ashfen also gets a "Buildings" backlink
---
```

Without `type`, backlinks fall back to the relation type's default category.

`type` is case-insensitive and supports spaces and hyphens:
`Building`, `building`, `BUILDING`, and `sea-port` all resolve correctly.

---

## Edge-aware labels via `byTargetType`

Some relation types produce different labels depending on what kind of article
is on the other end of the relation. This is defined in `relationTypes.js`
under `byTargetType`, and requires no extra front matter from the author.

For example, an ethnicity article relating to different kinds of targets:

```yaml
---
title: Vaelari
type: ethnicity
relations:
  species: Elf                  # forward label: "Found in", backlink: "Ethnicities"
  region: Vale of Embers        # forward label: "Found in", backlink: "Ethnic groups present"
  settlement: Ashfen            # forward label: "Found in", backlink: "Ethnic groups present"
  ethnicity: High Vaelari       # forward label: "Parent Ethnicity", backlink: "Subethnicity"
---
```

Each combination of source type + relation key automatically produces the
right label on both sides, without any extra front matter. The `byTargetType`
configuration in `relationTypes.js` defines these edge-specific overrides:

```js
ethnicity: {
    label: "Parent Ethnicity",
    inverse: "subethnicity",
    inverseLabel: "Subethnicity",

    byTargetType: {
        species: {
            inverse:            "ethnicities",
            inverseLabel:       "Ethnicity",
            inverseLabelPlural: "Ethnicities",
        },
        region: {
            label:              "Found in",
            inverse:            "ethnicGroups",
            inverseLabel:       "Ethnic group present",
            inverseLabelPlural: "Ethnic groups present",
        },
    },
},
```

**Stub articles** benefit from this too. If an article doesn't exist yet,
the system uses the relation key itself as a hint for the target type —
`relations.settlement: Emberville` assumes the target will eventually be a
settlement, and resolves labels accordingly right away.

---

## Front-matter forms

There are three levels of detail. Go deeper only when you need to override
something.

### Level 1 — Simple value

A bare string for one target, or an array for multiple. Fully automatic.

```yaml
relations:
  region: Vale of Embers
  knows: [Ser Aldric, Mira of Ashfen]
  tradePartners: [Port of Cael, Iron Reach]
```

---

### Level 2 — Group-level override

Wrap the targets in an object to override fields for **all** targets in that
relation at once. Only the fields you list are overridden; everything else
still comes from `relationTypes.js`.

```yaml
relations:
  region:
    targets: Vale of Embers
    inverseLabel: "Birthplace of"
```

`targets` accepts a single value or an array, just like level 1.

You can also override the type for all targets in the group — useful when the
source article plays a different role in one specific relation:

```yaml
relations:
  region:
    targets: [The Rusty Anchor, The Granary]
    type: building
```

Available fields at group level:

| Field | What it controls |
|---|---|
| `targets` | The target article(s) by title or ID |
| `type` | Source type for this relation (overrides article `type`) |
| `label` | Heading on **this** article's relation section |
| `labelPlural` | Heading when there are multiple targets |
| `inverse` | Bucket key used on the **target** article's backlinks |
| `inverseLabel` | Heading on the target's backlinks when count is 1 |
| `inverseLabelPlural` | Heading on the target's backlinks when count is > 1 |

---

### Level 3 — Per-target metadata

Use a list of objects under `targets` to control individual links. Useful for
person-to-person relationships, mixed target types, or adding flavour text.

```yaml
relations:
  region:
    targets:
      - id: The Rusty Anchor
        type: building
        description: "The old family inn, now a ruin."
      - id: Northern Vale
        type: subregion
      - id: Ashfen
        # no type — falls back to article type, then relation default
```

```yaml
relations:
  relationship:
    targets:
      - id: Ser Aldric
        label: "Guardian"
        inverseLabel: "Ward"
        sentiment: positive
        description: "The man who took her in after the fall of Ashfen."
        inverseDescription: "Raised her alone after the siege."
      - id: Lord Varek
        label: "Sworn enemy"
        inverseLabel: "Sworn enemy"
        sentiment: negative
        description: "Responsible for the destruction of her home."
```

Available fields per target:

| Field | What it controls |
|---|---|
| `id` | The target article's title or ID (required) |
| `type` | Source type for this specific link only |
| `label` | How **this** article labels that specific link |
| `inverseLabel` | How the **target** article labels the backlink |
| `sentiment` | Emotional quality — becomes a CSS class (see below) |
| `description` | Flavour text on **this** article's link |
| `inverseDescription` | Flavour text on the **target** article's backlink |

---

## Label priority

Every label and key walks the same priority chain, from most to least specific:

```
per-target front matter
  → group-level front matter
    → byTargetType edge override (from relationTypes.js)
      → base relation definition (from relationTypes.js)
        → auto-generated from key name
```

This means front matter always wins, definitions always provide a sensible
default, and you only write what differs from the expected behaviour.

---

## Type priority

When determining source type, the same principle applies:

```
per-target type  →  group-level type  →  article front matter type  →  null
```

- `null` means no edge-aware overrides apply; base relation definition is used.
- An article with `type: building` never needs to repeat it per relation.
- A group `type` overrides the article type for that one relation block.
- A per-target `type` is the most specific and overrides everything.

---

## Sentiment

Sentiment is a free-form string that becomes a CSS modifier class on the
rendered link element automatically (`relation-link--positive`, etc.).

```yaml
- id: Lord Varek
  sentiment: negative
  description: "Trouble follows him wherever he goes."
```

Suggested conventions (any value works):

| Value | Meaning |
|---|---|
| `positive` | Friendly, protective, admiring, loyal |
| `negative` | Hostile, fearful, distrustful, bitter |
| `neutral` | Formal, transactional, distant |
| `complex` | Ambivalent, conflicted, complicated history |

Sentiment applies to both ends of a link by default. If the other article also
defines the relationship, their sentiment fills in the other end independently.

---

## Bidirectional definitions

You can define the same relationship from both articles. The system detects the
duplicate and merges them — no duplicate entries are produced on either page.
The second article fills in details the first left blank, without overwriting.

```yaml
# ser-aldric.md
relations:
  relationship:
    targets:
      - id: Mira of Ashfen
        label: "Ward"
        sentiment: positive
        description: "Took her in after the fall of Ashfen."

# mira-of-ashfen.md
relations:
  relationship:
    targets:
      - id: Ser Aldric
        label: "Guardian"
        sentiment: positive
        description: "The only family she has ever known."
```

Result on Ser Aldric's page: link to Mira labelled "Ward" with his description.
Result on Mira's page: link to Aldric labelled "Guardian" with her description.

---

## Stub articles

You can create a relation to an article that has not been written yet. Use the
intended title as normal:

```yaml
relations:
  settlement: Emberville
```

If `Emberville` doesn't exist, the system creates a **stub node** automatically:
- It renders as plain text (no link) with a tooltip noting it's unwritten.
- It accumulates backlinks just like a real article.
- The relation key (`settlement`) is used to infer the target type, so
  edge-aware labels from `byTargetType` work even before the article exists.
- Once you write the article, the link resolves on the next build automatically.

All stubs are listed in the build log so you can track what still needs writing.

---

## Full example

```yaml
---
title: Vaelari
type: ethnicity
relations:
  # Level 1 — fully automatic, edge labels from byTargetType
  species: Elf
  region: Vale of Embers
  settlement: Ashfen

  # Level 2 — group override for a specific label
  ethnicity:
    targets: High Vaelari
    inverseLabel: "Descended from"

  # Level 3 — per-target detail for rich relationships
  relationship:
    targets:
      - id: Elder Saoirse
        label: "Spiritual leader"
        inverseLabel: "Her people"
        sentiment: positive
        description: "Keeper of the old ways."
      - id: The Sundered Council
        label: "Estranged kin"
        sentiment: complex
        description: "A painful schism, three generations old."
---
```

---

## Relation types reference

These types are pre-defined in `relationTypes.js`. Any type not listed still
works — its label is auto-generated from the key name.

### Geography

| Type | Forward label | Inverse key | Inverse label |
|---|---|---|---|
| `region` | Located in | `settlements` | Settlement / Settlements |
| `settlement` | Located in | `settlements` | Settlement / Settlements |
| `building` | Contains building(s) | `buildings` | Building / Buildings |
| `landmark` | Notable landmark(s) | `foundIn` | Found in |
| `borders` | Borders | `borders` | Borders |

### Society & culture

| Type | Forward label | Inverse key | Inverse label |
|---|---|---|---|
| `ethnicity` | Parent Ethnicity | `subethnicity` | Subethnicity / Subethnicities |
| `traditions` | Related tradition(s) | `practicedBy` | Practiced by |
| `religion` | Follows religion | `followers` | Follower / Followers |
| `ruledBy` | Ruled by | `rules` | Rules |

### Trade & economy

| Type | Forward label | Inverse key | Inverse label |
|---|---|---|---|
| `tradePartners` | Trade partner(s) | `tradePartners` | Trade partner(s) |
| `famousFor` | Famous for | `famousIn` | Famous in |

### People

| Type | Forward label | Inverse key | Inverse label |
|---|---|---|---|
| `relationship` | Related person/people | `relationship` | Related person/people |
| `knows` | Knows | `knows` | Knows |
| `memberOf` | Member of | `members` | Member / Members |
| `owner` | Owned by | `owns` | Owns |

### Conflict

| Type | Forward label | Inverse key | Inverse label |
|---|---|---|---|
| `enemies` | Enemy / Enemies | `enemies` | Enemy / Enemies |
| `allies` | Ally / Allies | `allies` | Ally / Allies |

---

## Adding your own types

Open `relationTypes.js` and add an entry:

```js
// Shorthand — symmetric, label only
knownRecipes: "Known recipes",

// Full definition — asymmetric with pluralisation
ingredient: {
    label:              "Found as ingredient in",
    inverse:            "ingredients",
    inverseLabel:       "Ingredient",
    inverseLabelPlural: "Ingredients",
},

// With edge-aware overrides
currency: {
    label:              "Used in",
    inverse:            "currencies",
    inverseLabel:       "Currency",
    inverseLabelPlural: "Currencies",

    byTargetType: {
        region: {
            inverse:            "regionalCurrencies",
            inverseLabel:       "Regional currency",
            inverseLabelPlural: "Regional currencies",
        },
    },
},
```

Use `byTargetType` whenever the same relation type should produce different
labels depending on what kind of article is on the other end.
