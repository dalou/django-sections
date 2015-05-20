from django.template.defaulttags import register


@register.filter
def get_item(dictionary, key):
    if dictionary:
        return dictionary.get(key)
    else:
        return None

@register.filter
def default_container(container, count=1):
    if not container or not len(container):
        defaults = []
        for i in range(count):
            defaults.append({
                'values': {}
            })
        return defaults
    return container


@register.simple_tag(takes_context=True)
def render_section(context, section, layout=False):
    request = context['request']
    if section:
        return section.render(request, layout=layout)
    else:
        return ""

@register.assignment_tag
def get_root_pages():
    from ..models import Page
    sections_pages = Page.objects.select_related('children').filter(is_enabled=True, parent=None)
    print sections_pages
    return sections_pages

