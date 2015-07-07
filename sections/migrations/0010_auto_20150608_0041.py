# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0009_remove_template_base64'),
    ]

    operations = [
        migrations.CreateModel(
            name='Version',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('number', models.IntegerField(default=1, verbose_name='Version')),
            ],
            options={
                'ordering': ('-number',),
                'verbose_name': 'Version',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='page',
            name='version',
            field=models.ForeignKey(related_name='pages', blank=True, to='sections.Version', null=True),
            preserve_default=True,
        ),
    ]
