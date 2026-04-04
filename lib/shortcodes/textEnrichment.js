const textTags = {
    small: "small",
    sub: "sub",
    sup: "sup",
    underline: "ins",
}

const wrap = (tag, text) => `<${tag}>${text}</${tag}>`;

export const textEnrichment = Object.fromEntries(
    Object.entries(textTags).map(
        ([key, tag]) => 
        [
            key,
            (text) => wrap(tag, text),
        ]
    )
);

export function mark() {

    const colouredMark = (tag, text, colour) => `<${tag} class="${colour}">${text}</${tag}>`

    return function(content, colour) {
        if (!colour) return wrap("mark", content);
        else return colouredMark("mark", content, colour);
    };
}

export function container() {
    return function(content, classes="") {
        if (!classes) return `<div>${content}</div>`;
        else return `<div class="${classes}">${content}</div>`;
    };
}