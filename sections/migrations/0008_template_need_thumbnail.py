# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0007_auto_20150515_1241'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='need_thumbnail',
            field=models.BooleanField(default=True, verbose_name='Thumbnail requit ?'),
            preserve_default=True,
        ),
    ]
