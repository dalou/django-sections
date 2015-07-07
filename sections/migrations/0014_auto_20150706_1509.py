# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0013_template_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='image_base64',
            field=models.TextField(null=True, verbose_name='image_base64', blank=True),
        ),
        migrations.AddField(
            model_name='template',
            name='image_base64_crop',
            field=models.CharField(max_length=254, null=True, verbose_name='image_base64_crop', blank=True),
        ),
        migrations.AlterField(
            model_name='template',
            name='source',
            field=models.TextField(default=b'\n\n\n\n\n\nNouvelle section\n\n\n\n\n\n', verbose_name='source'),
        ),
    ]
