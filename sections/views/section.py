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
from django.template.loader import get_template, render_to_string
from django.template import Context, RequestContext, Template as DjangoTemplate



from sections.models import Version, Page, Section, Template, TemplateCategory, SectionImage

logger = logging.getLogger(__name__)





# SECTIONS
@require_POST
@login_required
@csrf_exempt
def create(request):
    data = json.loads(request.body)
    page = Page.objects.get(pk=data.get('page'))
    template = Template.objects.get(pk=data.get('template'))
    section = Section()
    section.page = page
    section.data = {}
    section.template = template
    section.order = section.page.sections.count()
    section.save()
    return JsonResponse(section.to_json(), safe=False)

@require_POST
@login_required
@csrf_exempt
def update(request):

    data = json.loads(request.body)
    if data.get('pk'):
        section = Section.objects.select_related('page', 'template').get(pk=data.get('pk'))
    else:
        section = Section()


    if data.get('page'):
        page = Page.objects.get(pk=data.get('page'))
        if not section.pk:
            section.order = page.sections.count()

        section.page = page

    if data.get('template'):
        template = Template.objects.get(pk=data.get('template'))
        section.template = template

    if data.get('data'):
        section.data = data.get('data')


    section.save()
    import pprint
    pprint.pprint(section.data)
    return JsonResponse(section.to_json(), safe=False)

    # return render_to_response("sections/_editor_section.html", {
    #     "section": section,
    #     # "options": data.get('options', {})
    # })

@login_required
@csrf_exempt
def preview(request, pk):
    section = Section.objects.get(pk=pk)
    return HttpResponse(section.render(request, layout=True))


@require_POST
@login_required
@csrf_exempt
def reorder(request):
    data = json.loads(request.body)
    for order in data:
        section = Section.objects.get(pk=order.get('pk'))
        section.order = order.get('order')
        section.save()
    return HttpResponse("ok")

class EditorSectionView(generic.DetailView):
    template_name = "sections/editor_section.html"
    model = Section

    def get(self, request, *args, **kwargs):
        return super(EditorSectionView, self).get(request, *args, **kwargs)



@require_POST
@login_required
@csrf_exempt
def remove(request):
    data = json.loads(request.body)
    section = Section.objects.get(pk=data.get('pk'))
    section.delete()
    return HttpResponse('')
















class SectionForm(forms.ModelForm):
    class Meta:
        model = Section
        fields = ()


class SectionSave(generic.UpdateView):
    template_name = "sections/sections/_edit.html"
    context_object_name = "section"
    model = Section
    form_class = SectionForm

    def get_object(self, queryset=None):
        obj = None
        if 'pk' in self.kwargs:
            obj = super(SectionSave, self).get_object(queryset)
        self.creating = obj is None
        return obj


    def form_valid(self, form, *args, **kwargs):

        if self.creating:
            form.instance.category = TemplateCategory.objects.get(pk=self.kwargs.get('category'))
        t = form.save()

        return render_to_response(self.template_name, {
            "template": t,
            'form': form,
            "category": TemplateCategory.objects.get(pk=self.kwargs.get('category')) if self.creating else None
        })


    def get_context_data(self, *args, **kwargs):
        ctx = super(TemplateSave, self).get_context_data(*args, **kwargs)
        if self.creating:
            ctx['category'] = TemplateCategory.objects.get(pk=self.kwargs.get('category'))
        return ctx
