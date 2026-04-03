export default function quote(env) {
    return function(content, author = '') {
        return env.renderString(
            `{% from "components/quote.njk" import quote %}
             {{ quote(content, author) }}`,
            { content, author }
        );
    };
};
