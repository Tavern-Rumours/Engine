export function secret(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/secret.njk" import secret %}
             {{ secret(content) }}`,
            { content }
        )
    }
}

export function secretToggle(env) {
    return function(content, label = 'Unearth the Mystery!') {
        return env.renderString(
            `{% from "components/secret.njk" import secretToggle %}
             {{ secretToggle(content, label) }}`,
              { content, label }
        )
    }
}
