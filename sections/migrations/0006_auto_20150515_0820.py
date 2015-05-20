# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0005_auto_20150515_0042'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='is_ghost',
            field=models.BooleanField(default=False, verbose_name='Fantome ?'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='template',
            name='is_system',
            field=models.BooleanField(default=False, verbose_name='Systeme ?'),
            preserve_default=True,
        ),
    ]
