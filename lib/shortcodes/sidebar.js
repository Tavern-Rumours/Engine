export function sidebar(env) {
    return function(content, classes='col-md-4') {
        return env.renderString(
            `{% from "components/sidebar.njk" import sidebar %}
            {{ sidebar(content, classes) }}`,
             { content, classes }
        );
    };
};

export function sidebarRight(env) {
    return function(content, classes='col-md-4') {
        return env.renderString(
            `{% from "components/sidebar.njk" import sidebarRight %}
            {{ sidebarRight(content, classes) }}`,
             { content, classes }
        )
    }
}

export function sidebarLeft(env) {
    return function(content, classes='col-md-4') {
        return env.renderString(
            `{% from "components/sidebar.njk" import sidebarLeft %}
            {{ sidebarLeft(content, classes) }}`,
             { content, classes }
        )
    }
}

export function mainSidebar(env, markdown) {
    return function(content, position) {
        this.page.sidebar ??= {};
        this.page.sidebar[position] = markdown.render(content);

        return new String("");
    }
}
