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



from sections.models import Template, TemplateCategory
from sections.utils import get_current_version, set_current_version

logger = logging.getLogger(__name__)




class TemplateCategorySidebarList(generic.ListView):
    template_name = "sections/templates/_category_sidebar_list.html"
    context_object_name = "categories"
    model = TemplateCategory

    def get_queryset(self, *args, **kwargs):
        return TemplateCategory.objects.all()

    def get(self, request, *args, **kwargs):
        return super(TemplateCategorySidebarList, self).get(request, *args, **kwargs)


class TemplateCategoryForm(forms.ModelForm):
    class Meta:
        model = TemplateCategory
        exclude = ()

# @require_POST
# @login_required
class TemplateCategorySave(generic.UpdateView):
    template_name = "sections/templates/_menu.html"
    context_object_name = "template"
    model = TemplateCategory
    form_class = TemplateCategoryForm

    def get_object(self, queryset=None):
        obj = None
        if 'pk' in self.kwargs:
            obj = super(TemplateCategorySave, self).get_object(queryset)
        self.creating = obj is None
        return obj

    def form_valid(self, form, *args, **kwargs):

        tc = form.save()

        return render_to_response(self.template_name, { "template": tc })


class TemplateCategoryRemove(generic.UpdateView):
    pass







class TemplateList(generic.ListView):
    template_name = "sections/templates/_list.html"
    context_object_name = "templates"
    model = Template

    def get_queryset(self, *args, **kwargs):
        return Template.objects.filter(category__pk=self.kwargs.get('pk'))

    def get_context_data(self, *args, **kwargs):
        ctx = super(TemplateList, self).get_context_data(*args, **kwargs)
        ctx['category'] = TemplateCategory.objects.get(pk=self.kwargs.get('pk'))
        return ctx

class TemplateSidebarList(generic.ListView):
    template_name = "sections/templates/_sidebar_list.html"
    context_object_name = "templates"
    model = Template

    def get_queryset(self, *args, **kwargs):
        return Template.objects.filter(category__pk=self.kwargs.get('pk'))

    def get_context_data(self, *args, **kwargs):
        ctx = super(TemplateList, self).get_context_data(*args, **kwargs)
        ctx['category'] = TemplateCategory.objects.get(pk=self.kwargs.get('pk'))
        return ctx


class TemplateForm(forms.ModelForm):
    image_base64 = forms.CharField(required=True, widget=forms.Textarea)
    image_base64_crop = forms.CharField(required=False)
    class Meta:
        model = Template
        fields = ('source', 'image_base64', 'image_base64_crop')

class TemplateSave(generic.UpdateView):
    template_name = "sections/templates/_edit.html"
    context_object_name = "templates"
    model = Template
    form_class = TemplateForm

    def get_object(self, queryset=None):
        obj = None
        if 'pk' in self.kwargs:
            obj = super(TemplateSave, self).get_object(queryset)
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


class TemplateRemove(generic.ListView):
    template_name = "sections/templates/_edit.html"
    context_object_name = "templates"
    model = Template

    def get_queryset(self, *args, **kwargs):
        return Template.objects.filter(category__pk=self.kwargs.get('pk'))

    def get(self, request, *args, **kwargs):
        return super(TemplateRemove, self).get(request, *args, **kwargs)



@login_required
@csrf_exempt
def preview(request):

    if request.method == "POST":
        data = json.loads(request.body)
        template = Template(source=data.get('source'))
        # try:
        html = template.render(request, layout=bool(int(data.get('layout', True ))))
        # except Exception, e:
        #     html = 'Error : %s', e.message
        request.session['section_editor_template_preview'] = html
        return HttpResponse(reverse('sections_editor_template_preview'))

    elif request.method == "GET":
        return HttpResponse(request.session.get('section_editor_template_preview', 'Empty'))


