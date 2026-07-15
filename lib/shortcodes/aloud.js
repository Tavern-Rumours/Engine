export default function aloud(env) {
    return function(content, classes='') {
        return env.renderString(
            `{% from "components/aloud.njk" import aloud %}
             {{ aloud(content, classes) }}`,
            { content, classes }
        );
    };
};
