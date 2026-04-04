# Writing Content
Writing content to be transformed with the Tavern Rumours Engine should be relatively easy with [Markdown](https://www.markdownguide.org).. It's not as easy as something like Word or another graphical editor, there is no visual editor. _Yet._ That said, with a few adjustments, you will be writing quickly here and - contrary to Word - the Tavern Rumours Engine can transform your Markdown files into a website. The [`CSS Template`](./src/content/css-template.md) file contains a variety of elements that you can use in your writing and for tweaking the styling to your liking.

It is a long file - also including shortcodes - so here is a very quick cheat sheet for some of the common writing elements you will likely use:

| Style | Markdown |
| --- | --- |
| **Bold** | `**Bold**` |
| _Italic_ | `_Italic_` |
| **_Bold and Italic_** | `**_Bold and Italic_**` |
| ~~Strikethrough~~ | `~~Strikethrough~~` |
| [A URL to Google](www.google.com) | `[A URL to Google](www.google.com)` |
| Header 1..6 | `# Header 1`, `## Header 2`.. etc |

> ### ⚠️ Nearly all [Markdown](https://www.markdownguide.org) elements are supported, but not all of them in their Markdown format. For that, shortcodes have been created.

## Enhance the Look and Feel of your Website with Shortcodes
You might have read in the [README](/README.md) that you can use a set of pre-defined "shortcodes" to make your writing look even better. We already feel the questions coming: what _are_ these "shortcodes" and how do I even use them?

So, what are shortcodes? Shortcodes are custom elements that can be defined and created so the framework can parse them into the HTML format you want without having to write custom HTML in your content files. The idea is that your content files stay relatively clean.

So, what does that look like? Say, you want to put a nice quote with an author in your content. Markdown doesn't support that specific feature, so we've created our own. In your content, you'd write something like this:

```
{% quote "Author" %}
This is a quote!
{% endquote %}
```

Which generates this:
```html
<blockquote class="quote">
    This is a quote!<div class="author">Author</div>
</blockquote>
```

Don't you like the structure of the quote? Or do you want to add some extra flair by adding a CSS class or two? Simply go to [`quote.njk`](/src/_includes/components/quote.njk) and change the HTML there to your liking. You can do this with all the shortcodes.

> Are you ready to take the leap and add your own custom shortcode? Find out [here](/lib/shortcodes/README.md) how to do it!

The [`CSS Template`](./src/content/css-template.md) is filled with examples of the various shortcodes already available, including a few of the markdown native ones that aren't natively supported in [11ty/Eleventy](https://www.11ty.dev/docs/).

> In most cases, the shortcodes can be nested, so you can have quotes in quotes, if you'd like!

## List of Available Shortcodes
This is a list of the default available shortcodes. If you add new ones, add them here!

### `Text Enhancements`
| Element | Shortcode |
| --- | --- |
| `small` | `{% small "tiny text" %}` |
| `sub` | `{% sub "sub text" %}` |
| `sup` | `{% sup "sup text" %}` |
| `underline` | `{% underline "underline text" %}` |
| `mark` | `{% mark "marked text" %}` |
| coloured `mark` | `{% mark "marked text", "red" %}` |

> ⚠️ The colour passed to the coloured `mark` must be declared as a class in CSS, otherwise it won't show. By default, the colours for `mark` are defined in [`text.css`](/src/_styles/text.css).

### `Quote`
Without author
```
{% quote %}
Your Quote
{% endquote %}
```

With author
```
{% quote "Author" %}
Your Quote with Author
{% endquote %}
```

### `Aloud`
```
{% aloud %}
Your Aloud
{% endaloud %}
```

### `Spoiler`
```
{% spoiler "Reveal" %}
The Hidden Content
{% endspoiler %}
```

### `Sidebar`
```
{% sidebar %}
Your Sidebar
{% endsidebar %}
```

### `Image`
Without credits
```
{% image "/img/test.png", "Alt Text", "Title" %}{% endimage %}
```
Without credits and alt text and/or title
```
{% image "/img/test.png" %}{% endimage %}
```
With credits, all empty values must at least have `""`
```
{% image "/img/test.png" %}
{% credits "Art Title", "Art Url", "Artist", "Artist Url" %}
{% endimage %}

{% image "/img/test.png" %}
{% credits "Tavern Rumours", "https://github.com/Tavern-Rumours", "ShadowPhoenix", "https://github.com/Tavern-Rumours" %}
{% endimage %}
```

### `Tooltip`
For simple inline tooltips that show plain text when hovered over:
```
{% tooltip "Hover over me" %}This is an inline tooltip{% endtooltip %}
```
For more complex tooltips that show full markdown formatting when hovered over:
```
{% tooltip "Hover over me", "tooltip-id" %}
This is an extended tooltip that _should_ allow for more complex and longer markdown text, such as basic [urls](#) and more.
{% endtooltip %}
```
