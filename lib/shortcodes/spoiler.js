export default function spoiler(env) {
    return function(content, button) {
        return env.renderString(
            `{% from "components/spoiler.njk" import spoiler %}
             {{ spoiler(content, button) }}`,
            { content, button }
        );
    };
};