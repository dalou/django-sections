# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import libs.utils.files


class Migration(migrations.Migration):

    dependencies = [
        ('section', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Nom')),
                ('source', models.TextField(default=b'Nouvelle section', verbose_name='source')),
                ('image', models.ImageField(upload_to=libs.utils.files.unique_filename(b'sections/templates/images/%Y/%m/'), null=True, verbose_name='Image', blank=True)),
                ('public_hash', models.CharField(unique=True, max_length=64, verbose_name='Hash public')),
                ('order', models.IntegerField(default=0, verbose_name='Ordre')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterModelOptions(
            name='section',
            options={'ordering': ('order', 'type'), 'verbose_name': 'Section'},
        ),
    ]
