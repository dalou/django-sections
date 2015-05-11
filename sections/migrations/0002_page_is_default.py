# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='page',
            name='is_default',
            field=models.BooleanField(default=False, verbose_name='Default ?'),
            preserve_default=True,
        ),
    ]
