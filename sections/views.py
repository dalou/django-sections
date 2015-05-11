# encoding: utf-8

import logging
import traceback
import datetime
import json
import requests

from django import forms
from django.conf import settings
from django.utils import timezone
from django.views import generic
from django.db.models import Count, Q
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect, HttpResponsePermanentRedirect, Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, render_to_response
from django.template import Template, Context, RequestContext
from django.utils.translation import ugettext_lazy as _, ugettext
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models.loading import get_model
from django.utils import importlib
from django.template import Context, RequestContext, Template as DjangoTemplate
from django.template.loader import get_template_from_string


from sections.models import Page, Section, Template, SectionImage, SECTIONS

logger = logging.getLogger(__name__)



class PageView(generic.DetailView):
    template_name = "section/page_view.html"
    context_object_name = "page"
    model = Page

    def get(self, request, *args, **kwargs):

        return super(PageView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super(PageView, self).get_context_data(**kwargs)

        return ctx



class Screenshot(generic.View):

    def get(self, request, *args, **kwargs):
        public_hash = kwargs.get('hash')
        tmpl = Template.objects.get(public_hash=public_hash)
        return HttpResponse(tmpl.render(request))

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
def upload_section_image(request):
    image = request.FILES['image']
    section_image, created = SectionImage.objects.get_or_create(image=image)
    print "IMAGE CREATED", created
    return JsonResponse({
        'image': section_image.image.url
    })

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