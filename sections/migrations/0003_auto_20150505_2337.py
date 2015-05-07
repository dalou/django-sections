# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('section', '0002_auto_20150505_2312'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='section',
            options={'ordering': ('order', 'template'), 'verbose_name': 'Section'},
        ),
        migrations.RemoveField(
            model_name='section',
            name='type',
        ),
        migrations.AddField(
            model_name='section',
            name='template',
            field=models.ForeignKey(blank=True, to='section.Template', null=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='template',
            name='public_hash',
            field=models.CharField(max_length=64, null=True, verbose_name='Hash public', blank=True),
            preserve_default=True,
        ),
    ]
