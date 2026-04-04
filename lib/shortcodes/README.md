# Shortcodes in Tavern Rumours Engine
Shortcodes are effectively bits of HTML that are predefined and can be used to enhance the website generation with customised elements.

The shortcode system in the Tavern Rumours Engine provides a structured abstraction layer over [11ty/Eleventy](https://www.11ty.dev/docs) shortcodes, enabling:
- Reusable UI components with Nunjucks (`.njk`);
- Inline text formatting utilities;
- Advanced behaviour.

The shortcodes are designed around two main categories:

**_Paired Shortcode_**
| Used For: | Example |
| --- | --- |
| - Components <br>- Block-level UI <br>- Content Wrappers | {% quote %}<br>Quote Content<br>{% endquote %} |

**_Inline Shortcode_**
| Used For: | Example |
| --- | --- |
| - Text Transformations <br>- Lightweight HTML Injection | {% small "Text" %}

## Architecture
The registration and creation of shortcode is split between three files that make up the architecture.

[`/lib/shortcodes/index.js`](/lib/shortcodes/index.js) -> contains the registration of the shortcodes to make them available for use in the content files.

[`/lib/shortcodes`](/lib/shortcodes/) -> contains factory functions and logic for each shortcode, paired and/or advanced shortcodes have their own file whereas inline shortcodes usually reside in [`textEnrichment.js`](/lib/shortcodes/textEnrichment.js).

[`/src/_includes`](/src/_includes/) -> contains the markup files (Nunjucks) for the paired and/or advanced shortcodes; single HTML elements go in [`components`](/src/_includes/components/), more complex HTML structures go in [`partials`](/src/_includes/partials/).

## Creating a New Shortcode
If you want to create a new shortcode - paired or inline - the best way to do so is to work bottom up. If you want to create an inline shortcode, you can skip the first step.

### Step 1: Create the Markup File
Create a new Nunjucks (`.njk`) file in `/src/_includes` and put it in either the `components` or `partials` directory, depending on the type of shortcode you want to create: a component or a partial. So far, the convention is to put single HTML elements in `components` and more complex structures in `partials`.

#### Component
Components should be single HTML elements that put the content inside the element. They should be wrapped in a `{% macro %}` to allow the markdown _inside_ the shortcode to be rendered as markdown by the Engine. The name given to the macro is the name of the shortcode used in the content files.

##### Example: Component Markup File ([sidebar.njk](/src/_includes/components/sidebar.njk))
```njk
{% macro sidebar(content) %}
<aside>
    {{ content | safe }}
</aside>
{% endmacro %}
```

##### Example: Usage of Component in Content File
```md
{% sidebar %}
This is a sidebar
{% endsidebar %}
```

#### Partial
Partials should consist of multiple and more complex HTML elements that put the content inside the structure. This is often used for more advanced shortcodes with more business logic.

##### Example: Partial Markup File ([tooltip.njk](/src/_includes/partials/tooltip.njk))
```njk
{% if page.extendedTooltips %}
<div id="tooltip">
    <div class="content"></div>
</div>
{% for t in page.extendedTooltips %}<template id="{{ t.id }}">{{ t.renderedContent | safe }}</template>{% endfor %}
{% endif %}

<script src="/_scripts/tooltip.js"></script>
```

##### Example: Usage of Partial in Content File
```md
{% tooltip "An Extended Tooltip!", "tti-ex" %}
An extended tooltip that _should_ allow more for complex and longer markdown text, such as basic [urls](#) and more.
{% endtooltip %}
```

### Step 2: Create the Factory Function
Paired and advanced shortcodes get their own factory file. Inline shortcodes can reside in [`textEnrichment.js`](/lib/shortcodes/textEnrichment.js) since they are either small enough that they don't have inside markdown to be rendered. In some cases, when the code is otherwise small, they are put in this file too, like the `container` shortcode. That said, if you have a set of inline shortcodes, you're always free to put them in its separate file, of course.

Regardless of where it will live, you have to create a factory function that returns a function. They allow dependencies (like the Nunjucks environment or Markdown renderer) to be injected into the shortcodes at registration time.

Inline shortcodes will often return a function that simply returns a raw html.

##### Example: Inline Shortcode Factory Function ([textEnrichment.js](/lib/shortcodes/textEnrichment.js))
```js
export function container() {
    return function(content, classes="") {
        if (!classes) return `<div>${content}</div>`;
        else return `<div class="${classes}">${content}</div>`;
    };
}
```

Contrary to inline shortcodes, paired and advanced shortcodes use the Nunjucks environment to render structured HTML and safely inject processed Markdown content. Hence, factory function of these shortcodes returns an HTML string.

> In this Engine, it is convention to name your new file and the exported function the same as the markup file.

##### Example: Paired Shortcode Factory Function ([spoiler.js](/lib//shortcodes/spoiler.js))
```js
export default function spoiler(env) {
    return function(content, button) {
        return env.renderString(
            `{% from "components/spoiler.njk" import spoiler %}
             {{ spoiler(content, button) }}`,
            { content, button }
        );
    };
};
```

> Some shortcodes (like tooltip) use `this.page` to store page-specific data during rendering. This allows advanced features like deferred rendering or collecting content for later use.

### Step 3: Register the shortcode
Finally, the shortcode needs to be registered in the [`index.js`](/lib/shortcodes/index.js) file. For this, you add two lines to the file:

For shortcodes with their own `.js` file:
```js
import <function> from "./<function>.js";
```

For shortcodes added to existing files, you expand the existing import:
```js
import { textEnrichment, ... , <function> } from "./textEnrichment.js";
```

Then, you add the `<function>` variable to the list it belongs to.

> Does the Engine throw an error after registration? Try moving your `<function>` variable to the other list!