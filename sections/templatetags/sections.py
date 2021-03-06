from django.template.defaulttags import register
import json


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

@register.assignment_tag(takes_context=True)
def get_root_pages(context):
    request = context['request']
    from ..models import Page
    from ..utils import get_current_version, get_active_version
    sections_pages = Page.objects.select_related('parent').filter(is_enabled=True, parent=None, version=get_current_version(request))
    print sections_pages
    return sections_pages

@register.simple_tag
def render_style(element):
    if isinstance(element, dict):
        styles = element.get('styles', {})
        return "".join([ ("%s:%s;" % (key,value)) for key,value in element.get('styles', {}).items() ])
    return ""


@register.simple_tag
def render_element(name, values, styles, data):
    element = {
        'name': name
    }
    if isinstance(values, basestring):
        element['values'] = values

    if isinstance(styles, basestring):
        element['styles'] = styles

    output = """data-element='%s' data-element-name="%s" """ % (
        json.dumps(element),
        name
    )
    if data:
        output += """style="%s" """ % (
            render_style(data)
        )

    return output