export function image(env) {
    return function(content='', path, alt='', title='') {
        return env.renderString(
            `{% from "components/image.njk" import image %}
             {{ image(content, path, alt, title) }}`,
            { content, path, alt, title }
        )
    }
};

export function credits(title, title_url, artist, artist_url) {
    if (!title && !artist) return '';

    let titleHTML = title_url 
        ? `<span class="credit-title"><a href="${title_url}">${title}</a></span>` 
        : title 
        ? `<span class="credit-title">${title}</span>` 
        : '';

    let artistHTML = artist_url 
        ? `<span class="credit-artist"> by <a href="${artist_url}">${artist}</a></span>` 
        : artist 
        ? `<span class="credit-artist"> by ${artist}</span>` 
        : '';

    return `<div class="credits">${titleHTML}${artistHTML}</div>`;
}