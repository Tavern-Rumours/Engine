export default function aloud(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/aloud.njk" import aloud %}
             {{ aloud(content) }}`,
            { content }
        );
    };
};