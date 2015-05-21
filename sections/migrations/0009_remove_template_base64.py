# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0008_template_need_thumbnail'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='template',
            name='base64',
        ),
    ]
