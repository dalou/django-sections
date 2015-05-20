# encoding: utf-8
import os
from django.conf import settings
from django.apps import AppConfig

class DefaultConfig(AppConfig):
    name = 'sections'
    label = 'sections'
    verbose_name = u"Sections"

    def ready(self):


        from . import models
        # models.Template.objects.all().delete()
        try:
            models.Template.objects.filter(is_system=False).delete()
            models.Section.objects.filter(template=None).delete()

            models.Template.objects.filter(is_system=True).update(is_system=False, is_ghost=True)
            models.TemplateCategory.objects.filter(is_system=True).update(is_system=False, is_ghost=True)

            SECTIONS = {}
            ABS_SECTIONS_PATH = os.path.join(
                settings.DJANGO_ROOT,
                'templates/sections'
            )
            for section in os.listdir(ABS_SECTIONS_PATH):
                section_path = os.path.join(ABS_SECTIONS_PATH, section)

                if os.path.isdir(section_path):
                    section_category = section

                    if not SECTIONS.get(section_category):
                        SECTIONS[section_category] = []

                    for section2 in os.listdir(section_path):
                        section_path2 = os.path.join(section_path, section2)
                        if os.path.isfile(section_path2):


                            SECTIONS[section_category].append(section_path2)#.replace('.html', ''))

                elif os.path.isfile(section_path):
                    category = None
                    if not SECTIONS.get('Autres'):
                        SECTIONS['Autres'] = []
                    SECTIONS['Autres'].append(section_path)#.replace('.html', ''))

            for category, sections in SECTIONS.items():

                category_obj, created = models.TemplateCategory.objects.get_or_create(name=category)
                category_obj.is_system = True
                category_obj.is_ghost = False
                category_obj.save()
                for section in sections:
                    section_obj, created = models.Template.objects.get_or_create(
                        category=category_obj,
                        name=section.split('/')[-1].replace('.html', '')
                    )
                    section_obj.source = open(section, 'rb').read()
                    section_obj.is_system = True
                    section_obj.is_ghost = False
                    section_obj.save()
        except:
            print 'APP_CONFIGS SECTIONS ERROR'

