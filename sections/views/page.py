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
from sections.utils import get_current_version, set_current_version, get_active_version

logger = logging.getLogger(__name__)


# PAGES
@login_required
@csrf_exempt
def list(request):
    pages = []
    # current = get_current_page(request)
    for page in Page.objects.filter(parent=None, version=get_current_version(request)):

        # if current.pk == page.pk:
        #     page.is_current = True

        pages.append(page.to_json())

    return JsonResponse(pages, safe=False)

# @require_POST
# @login_required
# @csrf_exempt
# def image(request):
#     image = request.FILES['image']
#     section_image, created = SectionImage.objects.get_or_create(image=image)
#     print "IMAGE CREATED", created
#     return JsonResponse({
#         'image': section_image.image.url
#     })

@require_POST
@login_required
@csrf_exempt
def create(request):
    data = json.loads(request.body)
    page = Page(version=get_current_version(request))
    if data.get('parent'):
        parent = Page.objects.get(pk=data.get('parent'))
        page.parent = parent
        page.order = page.parent.children.count()
    else:
        page.order = Page.objects.filter(parent=None).count()
    page.name = data.get('name', 'Nouvelle page')
    page.save()
    return JsonResponse(page.to_json(), safe=False)

@require_POST
@login_required
@csrf_exempt
def update(request):
    data = json.loads(request.body)
    page = Page.objects.get(pk=data.get('pk'), version=get_current_version(request))
    if data.get('parent'):
        parent = Page.objects.get(pk=data.get('parent'), version=get_current_version(request))
        page.parent = parent
    page.name = data.get('name', page.name)
    page.save()
    return JsonResponse(page.to_json(), safe=False)


@require_POST
@login_required
@csrf_exempt
def reorder(request):
    data = json.loads(request.body)
    for order in data:
        page = Page.objects.get(pk=order.get('pk'), version=get_current_version(request))
        page.order = order.get('order')
        page.save()
    return HttpResponse("ok")

# class EditorSectionView(generic.DetailView):
#     template_name = "sections/editor_section.html"
#     model = Section

#     def get(self, request, *args, **kwargs):
#         return super(EditorSectionView, self).get(request, *args, **kwargs)




@require_POST
@login_required
@csrf_exempt
def remove(request):

    data = json.loads(request.body)
    page = Page.objects.get(pk=data.get('pk'), version=get_current_version(request))
    page.delete()
    return JsonResponse({}, safe=False)


class PageView(generic.DetailView):
    template_name = "sections/pages/view.html"
    context_object_name = "page"
    model = Page

    def get(self, request, *args, **kwargs):

        self.object = self.get_object()

        if self.request.user.is_authenticated and self.request.user.is_superuser:
            version = get_current_version(self.request)
        else:
            version = get_active_version()


        if self.object.version.pk != version.pk:
            self.object = Page.objects.filter(version=version, is_default=True).first()

            if self.object:
                return HttpResponseRedirect(self.object.get_absolute_url())
            else:
                raise Http404


        return super(PageView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super(PageView, self).get_context_data(**kwargs)
        current_version = get_current_version(self.request)
        ctx['pages'] = Page.objects.select_related('parent', 'version').filter(parent=None, version=current_version)
        ctx['versions'] = Version.objects.all()
        ctx['current_version'] = current_version

        ctx['template_categories'] = TemplateCategory.objects.exclude(is_ghost=True)
        return ctx

class PageDefaultView(PageView):
    template_name = "sections/pages/view.html"

    def get_object(self, *args, **kwargs):


        if self.request.user.is_authenticated and self.request.user.is_superuser:
            version = get_current_version(self.request)
        else:
            version = get_active_version()

        return Page.objects.filter(version=version, is_default=True).first()

    # def get(self, request, *args, **kwargs):
    #     return super(PageDefaultView, self).get(request, *args, **kwargs)

    # def get_context_data(self, **kwargs):
    #     ctx = super(PageDefaultView, self).get_context_data(**kwargs)
    #     ctx['page'] = Page.objects.select_related('parent').first()
    #     return ctx