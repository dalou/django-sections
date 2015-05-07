from django.template.defaulttags import register

@register.filter
def get_item(dictionary, key):
    if dictionary:
        return dictionary.get(key)
    else:
        return None


@register.simple_tag(takes_context=True)
def render_section(context, section, layout=False):
    request = context['request']
    if section:
        return section.render(request, layout=layout)
    else:
        return ""