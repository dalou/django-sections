# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0012_version_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='version',
            field=models.ForeignKey(related_name='templates', blank=True, to='sections.Version', null=True),
            preserve_default=True,
        ),
    ]
