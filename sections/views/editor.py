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
from sections.utils import get_current_version, set_current_version

logger = logging.getLogger(__name__)



class Editor(generic.TemplateView):
    template_name = "sections/editor.html"

    def get(self, request, *args, **kwargs):
        return super(Editor, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super(Editor, self).get_context_data(**kwargs)
        current_version = get_current_version(self.request)
        ctx['pages'] = Page.objects.select_related('parent', 'version').filter(parent=None, version=current_version)
        ctx['versions'] = Version.objects.all()
        ctx['current_version'] = current_version

        print Template.objects.all().count()

        ctx['template_categories'] = TemplateCategory.objects.exclude(is_ghost=True)
        return ctx