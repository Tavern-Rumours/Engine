# 📘 Tavern Rumours Engine
> A custom SSG implementation with 11ty that transforms your writing into a navigable website.

The Tavern Rumours Engine is a custom static site generation framework built on top of [11ty/Eleventy](https://www.11ty.dev/docs/) that will turn your writing into a beautiful website. Its goal is to:
- Transform your structured writing into a navigable website;
- Provide automatic navigation generation based on your file structure;
- Support creative workflows;
- Offer a clean separation of content, layout, and logic.

## Installation and commands
To be able to run the Tavern Rumours Engine, you need to have `node.js` installed and run some commands in the terminal. Don't have `node.js` on your system yet? The helpful folks of `node.js` have made an [installation guide](https://nodejs.org/en/download/)! After installing `node.js`, you can run the Engine.

Open a terminal and navigate to the directory of the Engine. During active development - whether you're tinkering with CSS and JavaScript, or you just want to see what your website looks like before uploading it - use `npm start` to spin up a development server on `http://localhost:8080/`.

> If you already have a server running on port `8080`, it'll automatically increment by one until it finds an open port.

If you just need to generate your site, you can run `npm run generate`.

## 🏗️ How Do I Use this Engine?
The Tavern Rumours Engine provides a baseline file structure for you to work in which separates the content from the layout and the logic. As a writer, your high-level workflow will look like this:

```
Write your content with Markdown (/content)
      ↓
Run the Tavern Rumours Pipeline
      ↓
Tavern Rumours applies custom enhancements:
  - Navigation Graph
  - Markdown Config
  - Nunjucks Environment
      ↓
Generated Site (/www)
      ↓
Upload your Generated Site to your domain
```

### Automatic Navigation
One of the pillars that makes the Tavern Rumours Engine stand out, is the built-in navigation system. It can automatically generate a navigation tree based on the file structure in `src/content/` and puts it in the navigation sidebar. No need to configure anything, just write and organise your files!

> The navigation tree itself is also ready to support breadcrumbs and `previous/next` navigation, but the relevant shortcodes haven't been made yet. They're on the backlog to be developed as soon as possible.

### Enhance the look and feel of your website
You can use the pre-existing shortcodes in your markdown file to enhance the look of your website: think quotes with authors, custom text fragment boxes with their own styling, spoilers, and more! [Writing Content](./WritingContent.md) will explain how to use the custom enhancements in your markdown files.

**But wait, I don't like how the pages look, can I change that?**\
Why yes, of course! By all means, go ahead, that's the purpose of this platform; to give you the freedom to design your website while keeping your content human readable in a - hopefully - intuitive and easy manner. You're free to change everything. Are the shortcodes not to your liking, or do you want to create your own custom shortcodes, that also completely fine!

Here's a list that makes it easy to remember where you need to change what:

| What | Where |
| --- | --- |
| HTML (the structure) | Find the `.njk` file of the element (`src/_includes`) or the layout (`src/_layouts`). |
| CSS (the styling) | Find the `.css` file that includes your element (`src/_styles`). |
| Custom JS Fanciness | Find or drop them in `src/_scripts`. |
| Create Shortcodes | Shortcodes are a bit more complex, so the [README](./lib/shortcodes/README.md) in [`/lib/shortcodes`](./lib/shortcodes/) will teach you that! |

### The File Structure
The Tavern Rumours Engine ships with a pre-defined file structure based on the configuration in `eleventy.config.js`. However, as with everything in this project, you are free to change it how you see fit. If you'd like to change the configuration, simply go to [`eleventy.config.js`](eleventy.config.js) and change these values:

```js
const workspace = "src";
const input = "content";
const output = "www";
const components = "_includes";
const data = "_data";
const layouts = "_layouts";
const scripts = "_scripts";
const styles = "_styles";
const images = `${input}/img`;
```

> ⚠️ Be aware! When you change the names of directories in `eleventy.config.js`, change them locally as well to avoid Eleventy getting sad and throwing errors.

Without changes to the configuration, the file structure will look like this:

```
Engine/
├── eleventy.config.js      # Core engine configuration
├── package.json            # Project metadata & scripts
├── lib/                    # Engine logic
│   ├── navigation.js       # Navigation graph builder
│   ├── markdown.config.js  # Markdown configuration
│   ├── nunjucks.js         # Nunjucks configuration
│   └── shortcodes/         # JS configuration for all shortcodes
│       └── index.js
│       └── <shortcode>.js
├── src/
│   ├── _data/              # Global data
│   ├── _includes/          # Components & Partials
│   ├── _layouts/           # Layout templates
│   ├── _scripts/           # JS assets
│   ├── _styles/            # CSS assets
│   └── content/            # Your actual writing/content
│       └── img/            # Images
└── www/                    # Generated output
```

> 💡 If you have your content in a github repository, you could attach it as a submodule after forking this repository!
