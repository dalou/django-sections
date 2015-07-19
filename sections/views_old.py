# encoding: utf-8

import logging
import traceback
import datetime
import json
import requests
import re

from django import forms
from django.conf import settings
from django.utils import timezone
from django.views import generic
from django.db.models import Count, Q
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect, HttpResponsePermanentRedirect, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import render, render_to_response
from django.template import Template, Context, RequestContext
from django.utils.translation import ugettext_lazy as _, ugettext
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models.loading import get_model
from django.utils import importlib
from django.template.loader import get_template, render_to_string, get_template_from_string
from django.template import Context, RequestContext, Template as DjangoTemplate



from sections.models import Version, Page, Section, Template, TemplateCategory, SectionImage

logger = logging.getLogger(__name__)

def get_current_version():
    version = Version.objects.filter(active=True).first()
    if not version:
        version = Version.objects.last()
    return version




class EditorTemplatesView(generic.ListView):
    template_name = "sections/_editor_templates.html"
    context_object_name = "templates"
    model = Template

    def get_queryset(self, *args, **kwargs):
        return Template.objects.filter(category__pk=self.kwargs.get('pk'))

    def get(self, request, *args, **kwargs):
        return super(EditorTemplatesView, self).get(request, *args, **kwargs)


class EditorPagesMenuView(generic.ListView):
    template_name = "sections/_editor_pages_menu.html"
    model = Page

    def get(self, request, *args, **kwargs):
        return super(EditorPagesMenuView, self).get(request, *args, **kwargs)









































class EditorPageView(generic.DetailView):
    template_name = "sections/editor_page.html"
    model = Page

    def get(self, request, *args, **kwargs):
        return super(EditorPageView, self).get(request, *args, **kwargs)



@csrf_exempt
def template_screenshot(request, hash):

    # if request.method == "POST":
    #     tmpl = Template.objects.get(pk=pk)
    #     import base64
    #     from django.core.files.uploadedfile import SimpleUploadedFile
    #     tmpl.base64 = None#request.POST.get('base64',tmpl.base64 )
    #     tmpl.image.delete()
    #     img_base64 = request.POST.get('base64').replace("data:image/png;base64,", "")
    #     png_recovered = base64.decodestring(img_base64)
    #     tmpl.image = SimpleUploadedFile('uploaded_file.png', png_recovered, content_type='image/png')
    #     tmpl.need_thumbnail = False
    #     tmpl.save()
    #     return HttpResponse(tmpl.image.url)

    # elif request.method == "GET":
    tmpl = Template.objects.get(public_hash=hash)
    try:
        html = tmpl.render(request, layout=bool(int(request.GET.get('layout', True ))))
    except:
        html = 'error'
    return HttpResponse(
        html
    )
















def get_data():
    data = {
        'pages': [],
        'template_categories': {}
    }
    for page in Page.objects.select_related('sections').filter(parent=None):
        data['pages'].append(page.to_json())

    for template in Template.objects.exclude(is_ghost=True):
        category_name = template.category.name if template.category else 'Autres'
        if not data['template_categories'].get(category_name):
            data['template_categories'][category_name] = {
                'pk': template.category.pk if template.category else None,
                'name': category_name,
                'is_system': template.category.is_system if template.category else True,
                'templates': []
            }
        data['template_categories'][category_name]['templates'].append({
            'pk': template.pk,
            'source': template.source,
            'image': template.image.url if template.image else None
        })

    data['template_categories'] = data['template_categories'].values()


    return data


@login_required
@csrf_exempt
def save_data(request):
    if request.method == "POST":
        data = json.loads(request.body)
        Page.from_json(data.get('pages', []))

        return JsonResponse({'src': reverse('sections-page-open')}, safe=False)


@login_required
@csrf_exempt
def page_load(request):
    request.session['sections_current_page'] = get_data()

    return JsonResponse(request.session['sections_data'], safe=False)



@login_required
@csrf_exempt
def page_open(request):
    if request.method == "POST":
        request.session['sections_current_page'] = json.loads(request.body)
        return JsonResponse({'src': reverse('sections-page-open')}, safe=False)

    elif request.method == "GET":
        try:
            data = request.session['sections_current_page']
            # import pprint
            # pprint.pprint( data )

            t = get_template("sections/page_view.html")


            page = Page(
                name=data.get('name'),
                order=data.get('order')
            )
            sections_html = []
            for section_json in data.get('sections', []):

                source = section_json.get('template', {})
                if source:
                    source = source.get('source', "")
                    tmpl = DjangoTemplate(source)
                    context = RequestContext(request, {
                        'section': section_json,
                        'page': page,
                        'token': section_json.get('token'),
                        'data': section_json.get('data', {}),
                    })
                    html = tmpl.render(context)
                    html = re.sub(r'<(\w+)\s+', r'<\1 id="%s" ' % section_json.get('token'), html, count=1)
                    sections_html.append( html )

                # template = Template(
                #     source = section_json.get('template', {}).get('source', "")
                # )
                # section = Section(
                #     template=template,
                #     data=data.get('data'),
                #     order=data.get('order'),
                #     page=page
                # )


            source = """{% extends 'base.html' %}
            {% block header %}{% endblock %}
            {% block main %}
                """ + "".join(sections_html) + """
            {% endblock %}
            {% block footer %}{% endblock %}"""
            tmpl = DjangoTemplate(source)
            context = RequestContext(request)
            return HttpResponse(tmpl.render(context))
            #return HttpResponse(page.render(request))
        except Exception, e:

            return HttpResponse(traceback.format_exc())

@login_required
@csrf_exempt
def load(request):
    if not request.session.get('sections_data'):
        request.session['sections_data'] = get_data()

    return JsonResponse(request.session['sections_data'], safe=False)

@login_required
@csrf_exempt
def update(request):
    print request.POST

    return JsonResponse({'OK': 'OK'}, safe=False)



@login_required
@csrf_exempt
def section_preview(request):
    if request.method == "POST":
        request.session['template_preview_source'] = request.POST.get('source')
        return HttpResponse("")
    else:
        tmpl = Template(source=request.session.get('template_preview_source', ""))
        return HttpResponse(tmpl.render(request))

class SectionLiveEdit(generic.View):

    def get(self, request, *args, **kwargs):
        section = None
        section_instance = None
        section_pk = self.request.GET.get('section_pk', None)
        section_type = self.request.GET.get('section_type', None)
        try:
            section = Section.objects.get(pk=section_pk)
            tmpl = section.template
        except:

            tmpl = Template.objects.get(pk=section_type)
            section = Section(template=tmpl)
        return HttpResponse(tmpl.render(request, section=section))




class SectionForm(forms.ModelForm):

    class Meta:
        model = Section
        # fields = ('pdf', 'type', 'code', 'coords')


    def __init__(self, *args, **kwargs):
        super(MediaForm, self).__init__(*args, **kwargs)
        self.fields['type'].required = True


@login_required
@csrf_exempt
def update_section(request):

    section_pk = request.POST.get('section_pk', None)
    section_type = request.POST.get('section_type', None)
    section_data = request.POST.get('section_data', {})
    section_order = request.POST.get('section_order', 0)
    section_title = request.POST.get('section_title', u'Section %s' % str((int(section_order)+1)))
    print request.POST
    section = None
    try:
        section = Section.objects.get(pk=section_pk)
    except:
        if section_type:
            template = Template.objects.get(pk=section_type)
            section = Section(template=template)


    if section:
        section.data = section_data
        section.order = section_order
        section.title = section_title
        section.save()
        return JsonResponse({
            'section_type' : section.template.pk,
            'section_pk' : section.pk,
            'section_data': section.data
        })
    else:
        raise Exception('invalid section_type "%s"' % section_type)

@require_POST
@login_required
@csrf_exempt
def remove_section(request):
    section_pk = request.GET.get('section_pk', None)
    print section_pk
    section = Section.objects.get(pk=section_pk)
    section.delete()
    return HttpResponse('')