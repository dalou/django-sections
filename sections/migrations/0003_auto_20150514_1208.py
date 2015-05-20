# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0002_page_is_default'),
    ]

    operations = [
        migrations.CreateModel(
            name='TemplateCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Nom')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='section',
            name='css',
            field=models.TextField(null=True, verbose_name='css', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='section',
            name='source',
            field=models.TextField(null=True, verbose_name='source', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='template',
            name='category',
            field=models.ForeignKey(related_name='templates', blank=True, to='sections.TemplateCategory', null=True),
            preserve_default=True,
        ),
    ]
