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
from sections.utils import  get_active_version, get_current_version, set_current_version, set_active_version
logger = logging.getLogger(__name__)

# PAGES
@login_required
@csrf_exempt
def list(request):
    versions = []
    current = get_current_version(request)
    active = get_active_version()
    # Version.tree.rebuild()
    for version in Version.objects.filter(parent=None):

        versions.append(version.to_json(current))

    return JsonResponse(versions, safe=False)

@require_POST
@login_required
@csrf_exempt
def create(request):
    data = json.loads(request.body)
    if data.get('parent'):
        parent = Version.objects.get(pk=data.get('parent'))
        version = Version()
        version.parent = parent
        last = version.parent.children.last()
        version.number = last.number + 1 if last else 1
    else:
        version = Version()
        last_version = Version.objects.filter(parent=None).last()
        if last_version:
            version.number = last_version.number + 1
        else:
            version.number = 1

    set_current_version(request, version)
    version.save()

    # if version.parent:
    #     pages = []
    #     for page in version.parent.pages.filter(parent=None):
    #         page.clone(version)

    set_current_version(request, version)

    return JsonResponse(version.to_json(), safe=False)


@require_POST
@login_required
@csrf_exempt
def set_current(request):
    data = json.loads(request.body)
    version = Version.objects.get(pk=data.get('pk'))
    set_current_version(request, version)
    version.save()
    return JsonResponse(version.to_json(), safe=False)

@require_POST
@login_required
@csrf_exempt
def set_active(request):
    data = json.loads(request.body)
    version = Version.objects.get(pk=data.get('pk'))
    set_active_version(version)
    version.save()
    return JsonResponse(version.to_json(), safe=False)




