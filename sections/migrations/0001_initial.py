# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import jsonfield.fields
import mptt.fields
import libs.utils.files
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Page',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(help_text=b"Le nom qui s'affichera dans le menu", max_length=255, verbose_name='Nom')),
                ('full_name', models.CharField(help_text=b'Parent > Nom', max_length=255, null=True, verbose_name='Nom complet', blank=True)),
                ('navbar_theme', models.CharField(default=b'default', max_length=254, verbose_name='Theme de la NavBar', choices=[(b'default', 'Normal'), (b'white', 'Fond Blanche')])),
                ('title', models.CharField(max_length=255, verbose_name='Titre')),
                ('resume', tinymce.models.HTMLField(help_text=b"Texte d'introduction", null=True, verbose_name='R\xe9sum\xe9', blank=True)),
                ('slug', models.SlugField(help_text=b'Identifiant unique de la cat\xc3\xa9gorie', unique=True, max_length=255, verbose_name='Slug')),
                ('order', models.IntegerField(default=0, verbose_name='Ordre')),
                ('is_enabled', models.BooleanField(default=True, verbose_name='Activ\xe9e')),
                ('meta_title', models.CharField(help_text="Si vide prend par d\xe9faut prend la valeur du 'Nom'", max_length=254, null=True, verbose_name='Titre page web', blank=True)),
                ('meta_description', models.TextField(help_text="Si vide prend par d\xe9faut prend la valeur du 'Nom'", null=True, verbose_name='Description page web', blank=True)),
                ('type', models.CharField(default=b'STANDARD', max_length=254, verbose_name='Type', choices=[(b'STANDARD', 'Normal')])),
                ('lft', models.PositiveIntegerField(editable=False, db_index=True)),
                ('rght', models.PositiveIntegerField(editable=False, db_index=True)),
                ('tree_id', models.PositiveIntegerField(editable=False, db_index=True)),
                ('level', models.PositiveIntegerField(editable=False, db_index=True)),
                ('parent', mptt.fields.TreeForeignKey(related_name='children', blank=True, to='sections.Page', null=True)),
            ],
            options={
                'ordering': ('order', 'lft', 'tree_id'),
                'verbose_name': 'Page',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(default=b'Section 1', max_length=255, verbose_name='Titre')),
                ('instance_id', models.PositiveIntegerField(null=True, blank=True)),
                ('order', models.IntegerField(default=0, verbose_name='Ordre')),
                ('is_enabled', models.BooleanField(default=True, verbose_name='Activ\xe9e')),
                ('data', jsonfield.fields.JSONField(default={}, verbose_name=b'Data')),
                ('instance_type', models.ForeignKey(blank=True, to='contenttypes.ContentType', null=True)),
                ('page', models.ForeignKey(related_name='sections', blank=True, to='sections.Page', null=True)),
            ],
            options={
                'ordering': ('order', 'template'),
                'verbose_name': 'Section',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SectionImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('path', models.CharField(default=b'/', max_length=255, verbose_name='path')),
                ('image', models.ImageField(upload_to=b'sections/images/%Y/%m/', null=True, verbose_name='Image', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Nom')),
                ('source', models.TextField(default=b'Nouvelle section', verbose_name='source')),
                ('image', models.ImageField(upload_to=libs.utils.files.unique_filename(b'sections/templates/images/%Y/%m/'), null=True, verbose_name='Image', blank=True)),
                ('public_hash', models.CharField(max_length=64, null=True, verbose_name='Hash public', blank=True)),
                ('order', models.IntegerField(default=0, verbose_name='Ordre')),
                ('css', models.TextField(null=True, verbose_name='css', blank=True)),
                ('stylus', models.TextField(null=True, verbose_name='stylus', blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='section',
            name='template',
            field=models.ForeignKey(blank=True, to='sections.Template', null=True),
            preserve_default=True,
        ),
    ]
