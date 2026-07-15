export default function button(env) {
    return function(content, url, classes='') {
        return env.renderString(
            `{% from "components/button.njk" import button %}
             {{ button(content, url, classes) }}`,
              { content, url, classes }
        )
    }
}
