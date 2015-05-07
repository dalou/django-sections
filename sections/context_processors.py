# encoding: utf-8
import datetime

from django.conf import settings

from apps.section.models import Page


def page(request):

    main_pages = Page.objects.select_related('children').filter(is_enabled=True, parent=None)
    return {
        'main_pages': main_pages,
    }