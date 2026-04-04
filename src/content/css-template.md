---
title: css-template
---

# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6

{% sidebar %}
I want a sidebar here...
{% endsidebar %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec consequat nisi, nec pharetra odio. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras pellentesque nisi mi, eu iaculis mi blandit vitae. Nulla sed purus magna. Fusce ac massa eu velit aliquam interdum. Aliquam et dictum est. Mauris suscipit ac nisi a condimentum. Duis commodo elementum varius. Quisque mauris purus, volutpat at est eu, viverra tempor mauris. Cras volutpat lorem et turpis luctus, ut finibus neque iaculis. Sed id odio finibus, rutrum risus eu, faucibus est. Nunc vestibulum nisl sed nisl accumsan lacinia. Vestibulum facilisis, augue et tincidunt dignissim, ex arcu finibus mi, non fringilla mi lacus vitae justo. Praesent congue lectus lorem, in auctor ipsum elementum at.

Sed feugiat sem sit amet nibh semper, at ornare lectus mattis. Maecenas euismod massa nunc, sed scelerisque neque sollicitudin sed. Mauris faucibus risus quam, ac consectetur est pretium vel. [Integer Aliquet](#) sit amet arcu non posuere. Nunc tempor neque eu nibh ultricies gravida. Pellentesque sit amet pulvinar sem. Fusce iaculis leo nec egestas consectetur. Donec placerat imperdiet augue ut imperdiet. Pellentesque {% tooltip "habitant morbi" %}A simple tooltip to demonstrate tooltips{% endtooltip %} tristique senectus et netus et malesuada fames ac turpis egestas.

{% sidebar %}
And maybe one here too
{% endsidebar %}

Text Styling\
**Bold Text**\
***Important Text***\
{% mark %}Default Marked Text{% endmark %}\
{% mark "red" %}Red Marked Text{% endmark %}\
{% mark "yellow" %}Yellow Marked Text{% endmark %}\
{% mark "green" %}Green Marked Text{% endmark %}\
{% small 'Smoll Text' %}\
~~Deleted Text~~\
{% underline 'Inserted Text' %}\
{% sub 'Subscript Text' %}\
{% sup 'Superscript Text' %}

[Homepage](#)
***
Tables

{% container "row" %}
{% container "col-md-6" %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec consequat nisi, nec pharetra odio. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras pellentesque nisi mi, eu iaculis mi blandit vitae. Nulla sed purus magna. Fusce ac massa eu velit aliquam interdum. Aliquam et dictum est. Mauris suscipit ac nisi a condimentum. Duis commodo elementum varius. Quisque mauris purus, volutpat at est eu, viverra tempor mauris. Cras volutpat lorem et turpis luctus, ut finibus neque iaculis. Sed id odio finibus, rutrum risus eu, faucibus est. Nunc vestibulum nisl sed nisl accumsan lacinia. Vestibulum facilisis, augue et tincidunt dignissim, ex arcu finibus mi, non fringilla mi lacus vitae justo. Praesent congue lectus lorem, in auctor ipsum elementum at.

{% endcontainer %}

{% container "col-md-6" %}

Sed feugiat sem sit amet nibh semper, at ornare lectus mattis. Maecenas euismod massa nunc, sed scelerisque neque sollicitudin sed. Mauris faucibus risus quam, ac consectetur est pretium vel. [Integer Aliquet](#) sit amet arcu non posuere. Nunc tempor neque eu nibh ultricies gravida. Pellentesque sit amet pulvinar sem. Fusce iaculis leo nec egestas consectetur. Donec placerat imperdiet augue ut imperdiet. Pellentesque {% tooltip "habitant morbi" %}A simple tooltip to demonstrate tooltips{% endtooltip %} tristique senectus et netus et malesuada fames ac turpis egestas.

{% endcontainer %}
{% endcontainer %}

| A | Markdown | Table |
| --- | --- | --- |
| What | Does | This |
| Look | Like | ? |

***
Special Blocks

{% quote %}
This is simply a small quote
{% endquote %}

{% quote "Author" %}
This is another small quote, but this time with an author.
{% endquote %}

{% quote %}
This is a more complex quote

{% quote %}
Because it has a quote in a quote
{% endquote %}

{% endquote %}

{% quote "Author"%}
This is a more complex authored quote

{% quote "Author 2" %}
Because it has a nested authored quote
{% endquote %}

{% endquote %}

{% aloud %}
This is a small WA aloud box
{% endaloud %}

{% quote %}
This is a more complex quote

{% aloud %}
Because it has a nested aloud box
{% endaloud %}

{% endquote %}

{% spoiler "A spoiler" %}
This is a spoiler!
{% endspoiler %}

{% spoiler "A spoiler" %}
This is a spoiler!

{% spoiler "Another spoiler" %}
With a nested spoiler!
{% endspoiler %}

{% endspoiler %}

{% quote %}
This is a more complex quote

{% spoiler "A spoiler!" %}
Because I'm hiding here
{% endspoiler %}

{% endquote %}

***

{% image "/img/tavern_rumours.png" %}{% endimage %}

{% image "/img/tavern_rumours.png", "alt text test" %}{% endimage %}

{% image "/img/tavern_rumours.png", "alt text test", "Title test" %}{% endimage %}

{% image "/img/tavern_rumours.png" %}
{% credits "Tavern Rumours", "", "ShadowPhoenix", "" %}
{% endimage %}

{% image "/img/tavern_rumours.png" %}
{% credits "Tavern Rumours", "https://github.com/Tavern-Rumours", "ShadowPhoenix", "https://github.com/Tavern-Rumours" %}
{% endimage %}

{% tooltip "A simple tooltip!" %}A simple tooltip to demonstrate tooltips{% endtooltip %}

{% tooltip "An Extended Tooltip!", "tti-ex" %}
An extended tooltip that _should_ allow more for complex and longer markdown text, such as basic [urls](#) and more.
{% endtooltip %}
