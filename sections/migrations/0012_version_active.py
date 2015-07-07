# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0011_templatecategory_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='version',
            name='active',
            field=models.BooleanField(default=False, verbose_name='Active'),
            preserve_default=True,
        ),
    ]
