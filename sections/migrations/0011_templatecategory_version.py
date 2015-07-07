# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0010_auto_20150608_0041'),
    ]

    operations = [
        migrations.AddField(
            model_name='templatecategory',
            name='version',
            field=models.ForeignKey(related_name='template_categories', blank=True, to='sections.Version', null=True),
            preserve_default=True,
        ),
    ]
