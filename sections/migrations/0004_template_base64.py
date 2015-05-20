# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0003_auto_20150514_1208'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='base64',
            field=models.TextField(default=b'', verbose_name='base64 img'),
            preserve_default=True,
        ),
    ]
