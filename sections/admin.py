# encoding: utf-8

import datetime
import operator

from django.conf import settings
from django.contrib import admin
from django.db import models
from django import forms
from django.db.models import get_model, Q, Count

import mptt
from libs.forms.owner import OwnerFormMixin

from libs.forms.fields import ColorField, DateTimeField
from libs.forms.widgets import ImageInput, DateTimeInput
from django.forms.widgets import HiddenInput
from tinymce.models import HTMLField
from tinymce.widgets import TinyMCE
from mptt.admin import MPTTModelAdmin
from feincms.admin import tree_editor

from sections.models import Page, Section, Template

# class PageAdminForm(forms.ModelForm):
#     theme_color = ColorField(label=u"Couleur", required=False)
#     class Meta:
#         model = Page
#         exclude = ()


class TemplateAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'get_image',
        'is_ghost',
        'is_system',
    )

    class Media:
        js = [
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/ace.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/mode-html.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/mode-twig.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/mode-stylus.js',
            settings.STATIC_URL + 'sections/js/admin_template.js',
            'sections/vendors/html2canvas.js',
        ]
        css = {
            'all': (
            )
        }


    def get_image(self, obj):
        return u"""<img src="%s" style="max-height:200px"/>""" % (obj.image.url if obj.image else None)
    get_image.allow_tags = True

admin.site.register(Template, TemplateAdmin)

class PageAdmin(tree_editor.TreeEditor):

    formfield_overrides = {
        models.DateField: {'widget': DateTimeInput },
        # models.ImageField: {'widget': ImageInput },
        HTMLField: {'widget': TinyMCE },
    }
    sortable_field_name = "order"

    list_max_show_all = 500

    # form = PageAdminForm
    inlines = (
        # SectionAdmin,
    )

    list_display = (
        'name',
        'parent',
        'title',
        'order',
        'is_enabled',
        'is_default',
    )
    list_display_links = ('name', )
    list_editable = ('parent', 'order', 'is_enabled', 'is_default')
    list_filter = ()
    sortable_field = 'order'

    # filter_horizonal = ('categories',)
    #prepopulated_fields = {'slug': ('name',)}
    #inlines = (SubPageInline, ModuleInline,)
    suit_form_includes = (
         ('section/_admin_sections.html', 'bottom', ''),
    )

    # suit_form_tabs = (
    #     ('infos', u"Informations"),
    #     # ('content', u"Contenus"),
    #     ('metas', u"Mots clés"),
    # )

    fieldsets = (
        ('Informations', {
            # 'classes': ('suit-tab suit-tab-infos',),
            'fields': ('name', 'parent', 'type', 'is_enabled', 'navbar_theme') #, 'display_filters')
        }),
        # ('Contenu', {
        #     'classes': ('suit-tab suit-tab-content',),
        #     'fields': ('title', 'resume', ) #, 'display_filters')
        # }),
        (u"Mots clés", {
            # 'classes': ('suit-tab suit-tab-metas',),
            'fields': ('meta_title', 'meta_description',)
        }),
    )

    class Media:
        js = [
            # settings.STATIC_URL + 'vendors/dropzone.min.js',
            # settings.STATIC_URL + 'vendors/cropper.js',
            settings.STATIC_URL + 'sections/js/editor.js',
            settings.STATIC_URL + 'sections/js/plugins/image.js',
            settings.STATIC_URL + 'sections/js/plugins/image_background.js',
            settings.STATIC_URL + 'sections/js/plugins/rich_text.js',
            settings.STATIC_URL + 'sections/js/plugins/text.js',
            settings.STATIC_URL + 'sections/js/plugins/char.js',
            'js/select2.js',
            'vendors/jquery.datetimepicker.js',
            settings.STATIC_URL + 'vendors/jquery.smooth-scroll.min.js',
            settings.STATIC_URL + 'vendors/jquery.form.js',
            "https://code.jquery.com/ui/1.11.3/jquery-ui.min.js"
        ]
        css = {
            'all': (
                # settings.STATIC_URL + 'vendors/cropper.css',
                settings.STATIC_URL + 'vendors/jquery.datetimepicker.css',
                'css/select2.css'
            )
        }
    #def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
    def render_change_form(self, request, context, **kwargs):

        context.update({
            'sections_and_unlinked': Section.objects.filter(Q(page=None) | Q(page=kwargs.get('obj', None)) ),
            'available_sections': Template.objects.all()
        })
        return super(PageAdmin, self).render_change_form(request, context, **kwargs)

    def save_model(self, request, obj, form, change):

        obj.save()

        unlinked_sections = Section.objects.filter(page=None, )

        for unlinked_section in unlinked_sections:
            unlinked_section.page = obj
            unlinked_section.save()

admin.site.register(Page, PageAdmin)
