# encoding: utf-8
import datetime

from django.conf import settings

from sections.models import Page


def page(request):

    sections_pages = Page.objects.select_related('children').filter(is_enabled=True, parent=None)
    return {
        'sections_pages': sections_pages,
    }