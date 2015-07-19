# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import mptt.fields


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0014_auto_20150706_1509'),
    ]

    operations = [
        migrations.AddField(
            model_name='version',
            name='parent',
            field=mptt.fields.TreeForeignKey(related_name='children', blank=True, to='sections.Version', null=True),
        ),
    ]
