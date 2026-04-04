export default function sidebar(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/sidebar.njk" import sidebar %}
            {{ sidebar(content) }}`,
             { content }
        );
    };
};