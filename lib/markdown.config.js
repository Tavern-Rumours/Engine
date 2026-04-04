import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";

const markdown = markdownIt({
        html: true,
        breaks: false,
        linkify: true,
    })
    .use(markdownItAttrs);

export default markdown;