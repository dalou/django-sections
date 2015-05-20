# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0004_template_base64'),
    ]

    operations = [
        migrations.AlterField(
            model_name='template',
            name='base64',
            field=models.TextField(null=True, verbose_name='base64 img', blank=True),
            preserve_default=True,
        ),
    ]
