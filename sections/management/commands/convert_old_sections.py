from django.conf import settings
from django.utils.module_loading import import_module
from django.core.management.base import BaseCommand
from libs.watchers import FontforgeWatcher

from apps.section.models import Section as OldSection, Page as OldPage, Template as OldTemplate
from sections.models import Section, Page, Template

class Command(BaseCommand):
    args = ''
    help = 'ex: ./manage.py convert_old_sections'

    def handle(self, *args, **options):
        for old_template in OldTemplate.objects.all():
            template, created = Template.objects.get_or_create(name=old_template.name)
            template.source = old_template.source
            template.image = old_template.image
            template.public_hash = old_template.public_hash
            template.order = old_template.order
            template.save()

        for old_page in OldPage.objects.all():
            page, created = Page.objects.get_or_create(name=old_page.name)
            page.full_name = old_page.full_name
            page.navbar_theme = old_page.navbar_theme
            page.title = old_page.title
            page.resume = old_page.resume
            page.slug = old_page.slug
            page.is_enabled = old_page.is_enabled
            page.meta_title = old_page.meta_title
            page.meta_description = old_page.meta_description
            page.type = old_page.type
            page.lft = old_page.lft
            page.tree_id = old_page.tree_id
            page.save()

        Page.tree.rebuild()

        for old_page in OldPage.objects.all():
            page, created = Page.objects.get_or_create(name=old_page.name)
            parent = Page.objects.get(name=old_page.parent.name) if old_page.parent else None

            print page, parent
            page.parent = parent
            page.save()


            page.sections.all().delete()
            for old_section in OldSection.objects.all():
                template = Template.objects.get(name=old_section.template.name)
                section = Section.objects.create(
                    page=page,
                    title=old_section.title,
                    order=old_section.order,
                    is_enabled=old_section.is_enabled,
                    template=template,
                    data=old_section.data,
                )
                #print section