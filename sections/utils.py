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



from sections.models import Version

logger = logging.getLogger(__name__)

def get_current_version(request):
    if not request.session.get('__sections_current_version__'):
        active_version = get_active_version()
        request.session['__sections_current_version__'] = active_version.pk

    return Version.objects.get(pk=request.session.get('__sections_current_version__'))


def set_current_version(request, version):
    request.session['__sections_current_version__'] = version.pk

def get_active_version():
    version = Version.objects.filter(active=True).first()
    if not version:
        version = Version.objects.last()
    return version
