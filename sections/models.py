# encoding: utf-8
import os
import requests
import re
import json

from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.db.models.signals import class_prepared
from django.utils.safestring import mark_safe
from django.core.urlresolvers import reverse, resolve
from django.db.models.loading import get_model
from django.db.models import Q, Count
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _, ugettext
from django.utils import importlib
from django.db.models.loading import get_model
from django.contrib.admin.templatetags.admin_urls import admin_urlname
from django.core.files.base import ContentFile
from django.template.loader import get_template, render_to_string, get_template_from_string
from django.template import Context, RequestContext, Template as DjangoTemplate
import base64 as base64_original
from django.core.files.uploadedfile import SimpleUploadedFile


from tinymce.models import HTMLField
from jsonfield import JSONField

from mptt.models import MPTTModel, TreeForeignKey, TreeManyToManyField, TreeManager
from mptt import register as mptt_register
from tinymce.models import HTMLField
from libs.models.tracking import TrackingCreateAndUpdateMixin
from libs.utils import canonical_url, unique_filename, random_token

from stylus import Stylus
compiler = Stylus()

from libs.models.fields import CroppableImageField
from lxml import etree

# SECTIONS = {}
# SECTIONS_IMAGES = []
# ABS_SECTIONS_PATH = os.path.join(
#     settings.DJANGO_ROOT,
#     'templates/sections'
# )
# for section in os.listdir(ABS_SECTIONS_PATH):
#     section_path = os.path.join(ABS_SECTIONS_PATH, section)

#     if os.path.isdir(section_path):
#         section_category = section
#         SECTIONS[section_category] = []
#         for section in os.listdir(section_path):
#             section_path = os.path.join(section_path, section)
#             if os.path.isfile(section_path):

#                 SECTIONS[section_category].append(section)#.replace('.html', ''))

#     elif os.path.isfile(section_path):
#         if not SECTIONS.get('Autres'):
#             SECTIONS['Autres'] = []
#         SECTIONS['Autres'].append(section)#.replace('.html', ''))


# print SECTIONS

class Page(MPTTModel):

    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')
    name = models.CharField(u"Nom", max_length=255, help_text="Le nom qui s'affichera dans le menu")
    full_name = models.CharField(u"Nom complet", max_length=255, help_text="Parent > Nom", blank=True, null=True)

    NAVBAR_THEME_STANDARD, NAVBAR_THEME_WHITE = ('default', 'white' )
    NAVBAR_THEME_CHOICES = (
        (NAVBAR_THEME_STANDARD, _(u"Normal")),
        (NAVBAR_THEME_WHITE, _(u"Fond Blanche")),
    )
    navbar_theme = models.CharField(max_length=254, choices=NAVBAR_THEME_CHOICES, default=NAVBAR_THEME_STANDARD, verbose_name=_(u"Theme de la NavBar"))

    title = models.CharField(u"Titre", max_length=255)

    resume = HTMLField(u"Résumé", help_text="Texte d'introduction", blank=True, null=True)
    slug = models.SlugField(u"Slug", unique=True, max_length=255, help_text="Identifiant unique de la catégorie")

    order = models.IntegerField(u"Ordre", default=0)
    is_enabled = models.BooleanField(u"Activée", default=True)
    is_default = models.BooleanField(u"Default ?", default=False)

    meta_title = models.CharField(u"Titre page web", max_length=254, blank=True, null=True, help_text=u"Si vide prend par défaut prend la valeur du 'Nom'")
    meta_description = models.TextField(u"Description page web", blank=True, null=True, help_text=u"Si vide prend par défaut prend la valeur du 'Nom'")

    TYPE_STANDARD,  = ('STANDARD', )
    TYPE_CHOICES = (
        (TYPE_STANDARD, _(u"Normal")),
    )
    type = models.CharField(max_length=254, choices=TYPE_CHOICES, default=TYPE_STANDARD, verbose_name=_(u"Type"))

    # objects = CategoryQueryset()
    tree = TreeManager()

    class Meta:
        ordering = ('order', 'lft', 'tree_id' )
        verbose_name = u"Page"

    class MPTTMeta:
        order_insertion_by = ('order', )

    def __unicode__(self):
        if self.full_name:
            return self.full_name
        else:
            self.save()
        return self.full_name

    def save(self, *args, **kwargs):
        #if not self.slug:
        name = [self.name]
        try:
            ancestors = self.get_ancestors(ascending=False)
            for category in ancestors:
                name.append(category.name)
        except:
            pass
        name.reverse()
        slug = slugify("_".join(name))

        self.full_name = u"%s%s" % (
            (u"%s > " % unicode(self.parent)) if self.parent else "",
            self.name
        )

        self.slug = slug
        # i = 1
        # while Category.objects.exclude(pk=self.pk).filter(slug=self.slug).exists():
        #     self.slug = "%s-%s" % (slug, i)
        #     i += 1

        super(Page, self).save(*args, **kwargs)




    def render(self, request):
        # tmpl = DjangoTemplate(template)
        # template = """"""
        # for section in self.sections.all():
        #     template += section.source

        t = get_template("sections/page_view.html")
        # print self.sections.all()
        context = RequestContext(request, {
            'sections': self.sections.all(),
            'page': self,
        })
        rendered = t.render(context)
        return rendered

        # tmpl = DjangoTemplate("sections/page_view.html")
        # context = RequestContext(request, {
        #     'sections': self.sections.all(),
        #     'page': self,
        # })
        # html = tmpl.render(context)


    def get_menu_title(self):
        return self.name

    @models.permalink
    def get_absolute_url(self):
        if self.type == Page.TYPE_STANDARD:
            return ('sections_page-view', (), {'slug': self.slug, 'pk': self.pk})

    def to_json(self):
        # sections = []
        # for section in self.sections.all():
            # sections.append(section.to_json())
        return {
            'pk': self.pk,
            'name': self.name,
            'order': self.order,
            'url': self.get_absolute_url(),
            # 'sections': sections,
            'pages': [ child.to_json() for child in self.get_descendants() ]
        }

    @staticmethod
    def from_json(data, rebuild=True, parent=None):
        for page_json in data:
            if  page_json.get('pk'):
                page = Page.objects.get(pk=page_json.get('pk'))
            else:
                page = Page()

            if parent:
                page.parent = parent
            elif page_json.get('parent'):
                page.parent = Page.objects.get(pk=page_json.get('parent'))
            else:
                page.parent = None

            page.name = page_json.get('name')
            page.order = page_json.get('order', 0)
            page.save()

            Page.from_json(page_json.get('pages', []), rebuild=False, parent=page)
            Section.from_json(page_json.get('sections', []), page=page)

        if rebuild:
            Page.tree.rebuild()



mptt_register(Page,)


class TemplateCategory(models.Model):

    name = models.CharField(u"Nom", max_length=255)
    is_system = models.BooleanField(u"Systeme ?", default=False)
    is_ghost = models.BooleanField(u"Fantome ?", default=False)

    def __unicode__(self):
        return u"%s" % ( self.name )


    def to_json(self):
        return {
            'pk': self.pk,
            'name': self.name,
            #'order': self.order,
            'templates': [ template.to_json() for template in self.templates.all() ]
        }

class Template(models.Model):

    category = models.ForeignKey('sections.TemplateCategory', related_name="templates", null=True, blank=True)

    name = models.CharField(u"Nom", max_length=255)
    source = models.TextField(u"source", default="Nouvelle section")
    # base64 = models.TextField(u"base64 img", blank=True, null=True)
    image = models.ImageField(_(u"Image"),
                                    upload_to=unique_filename("sections/templates/images/%Y/%m/"),
                                    blank=True, null=True)
    public_hash = models.CharField(_(u"Hash public"), max_length=64, blank=True, null=True)
    order = models.IntegerField(u"Ordre", default=0)

    css = models.TextField(u"css", blank=True, null=True)
    stylus = models.TextField(u"stylus", blank=True, null=True)

    is_system = models.BooleanField(u"Systeme ?", default=False)
    is_ghost = models.BooleanField(u"Fantome ?", default=False)
    need_thumbnail = models.BooleanField(u"Thumbnail requit ?", default=True)

    def __unicode__(self):              # __unicode__ on Python 2
        return u"%s" % ( self.name )


    def to_json(self):
        return {
            'pk': self.pk,
            'name': self.name,
            'source': self.source,
            'image': self.image.url if self.image else None,
            'css': self.css
        }

    def render(self, request, section=None, layout=True):
        if layout:
            source = """{% extends 'base.html' %}
            {% block header %}{% endblock %}
            {% block main %}
                """ + self.source + """
            {% endblock %}
            {% block footer %}{% endblock %}"""
        else:
            source = self.source
        tmpl = DjangoTemplate(source)

        context = RequestContext(request, {
            'section': section,
            'page': section.page if section else None,
            'data': section.data if section else None,
        })
        html = tmpl.render(context)
        if request.user.is_authenticated() and request.user.is_staff:
            html = re.sub(r'<(\w+)\s+', r"""<\1 name="section-%s" data-section="%s" data-section-order="%s" data-section-page="%s" """ % (
                # section.pk,
                # json.dumps(section.data),
                section.pk if section else None,
                section.pk if section else None,
                section.order if section else None,
                section.page.pk if section else None,

            ), html, count=1)
        return html

    def save(self, *args, **kwargs):
        if not self.pk:
            self.order = Template.objects.all().count()
        if not self.public_hash:
            self.public_hash = random_token([self.name])

        # if not self.image and self.base64:

        #     base64 = self.base64.replace("data:image/png;base64,", "")

        #     png_recovered = base64_original.decodestring(base64)
        #     self.image = SimpleUploadedFile('uploaded_file.png', png_recovered, content_type='image/png')
        #     self.base64 = None


        # if self.stylus:
        #     self.css = compiler.compile(self.stylus)

        super(Template, self).save(*args, **kwargs)

        # from ghost import Ghost
        # ghost = Ghost()
        # url = canonical_url(reverse("sections_editor_template_screenshot", kwargs={ 'hash': self.public_hash }))
        # print url
        # page, extra_resources = ghost.open(url)
        # page, resources = ghost.wait_for_page_loaded()
        # print page

        # print ghost.capture_to('/tmp/header.png', selector="body")



        # print "Template"
        # print canonical_url(reverse('sections_template-screenshot', kwargs={'hash': self.public_hash}))

        # url=canonical_url(reverse('sections_template-screenshot', kwargs={'hash': self.public_hash}))

        # if not settings.LOCAL_SERVER:
        #     r = requests.post("https://api.cloudconvert.com/convert?\
        #         apikey=01e9uBS3tIue9TUc_tEZdU-wl_uhqWmTk7SNYSydWo9Zs7T18RubngEg42Uiel3rqRoefj12NaqbXoHkjHu0dA&\
        #         input=url\
        #         &download=inline\
        #         &inputformat=website\
        #         &outputformat=png\
        #         &file=%s" % (url)
        #     )
        #     self.image.delete()
        #     filename = self.image.field.generate_filename(self.pk, '.png')
        #     self.image.storage.save(filename, ContentFile(r.content))
        #     self.save()
        # else:
        #     output_file=u'/tmp/html2png.pdf'


            # wkhtmltopdf(
            #     url, output_file
            # )
            # f = open(output_file, 'rb')

            # self.image#delete()
            # filename = self.image.field.generate_filename(self.pk, '.png')
            # self.image.storage.save(filename, ContentFile(f.read))
            # self.save()
            #print img


class Section(models.Model):

    page = models.ForeignKey('sections.Page', related_name="sections", null=True, blank=True)

    title = models.CharField(u"Titre", max_length=255, default="Section 1")

    instance_type = models.ForeignKey(ContentType, null=True, blank=True)
    instance_id = models.PositiveIntegerField(null=True, blank=True)
    instance = GenericForeignKey('instance_type', 'instance_id')

    order = models.IntegerField(u"Ordre", default=0)
    is_enabled = models.BooleanField(u"Activée", default=True)
    template = models.ForeignKey(u"sections.Template", null=True, blank=True)
    source = models.TextField(u"source", blank=True, null=True)
    css = models.TextField(u"css", blank=True, null=True)




    data = JSONField("Data", default={})

    # Search
    # User.objects.get(jsonfield__contains={'username':username})


    class Meta:
        # unique_together   = ('instance_type', 'instance_id')
        ordering = ('order', 'template' )
        verbose_name = u"Section"

    def render(self, request, layout=False):
        if self.template:
            return self.template.render(request, section=self, layout=layout)
        else:
            return ''

    def get_data(self):
        return self.data

    def to_json(self):
        return {
            'pk': self.pk,
            'template_pk': self.template.pk if self.template else None,
            'order': self.order,
            'data': self.data
        }

    @staticmethod
    def from_json(data, page=None):
        for section_json in data:
            template = section_json.get('template', {})
            if template:
                template = Template.objects.get(pk=template.get('pk'))

                if  section_json.get('pk'):
                    section = Section.objects.get(pk=section_json.get('pk'))
                else:
                    section = Section()

                section.template = template

                if page:
                    section.page = parent
                elif section_json.get('page'):
                    section.page = Page.objects.get(pk=section_json.get('page'))
                else:
                    section.page = None

                section.data = section_json.get('data', {})
                section.order = section_json.get('order', 0)
                section.save()


    def __str__(self):              # __unicode__ on Python 2
        return u"%s - %s" % ( self.template, self.page )

class SectionImage(models.Model):
    path = models.CharField(u"path", max_length=255, default="/")
    image = models.ImageField(_(u"Image"),
                                    upload_to="sections/images/%Y/%m/",
                                    blank=True, null=True)

class SectionFormMixin(object):

    def get_section_type(self):
        return self.Meta.model.__class__.__name__


class SectionMixin(object):
     @property
     def get_section(self):
         ctype = ContentType.objects.get_for_model(self.__class__)
         try:
             section = Section.objects.get(instance_type__pk=ctype.id, instance_id=self.id)
         except:
            return None
         return section

     def get_template(self):
        return 'sections/%s.html' % self.get_section_type()

     def get_section_type(self):
        print self
        return self.__class__.__name__

# for section in SECTIONS:
#     section_module = importlib.import_module("apps.section.sections.%s.models" % (section, ))





