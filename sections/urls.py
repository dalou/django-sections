from django.conf.urls import patterns, url

import sections.views.editor
import sections.views.page
import sections.views.template
import sections.views.section
import sections.views.element
import sections.views.version

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
# urlpatterns = patterns('django_documents.views',
#     url(r'^post/$', 'documents.post_document', name='documents-post-document'),
#     url(r'^posted/$', 'documents.document_done', name='documents-document-done'),
#     url(r'^flag/(\d+)/$', 'moderation.flag', name='documents-flag'),
#     url(r'^flagged/$', 'moderation.flag_done', name='documents-flag-done'),
#     url(r'^delete/(\d+)/$', 'moderation.delete', name='documents-delete'),
#     url(r'^deleted/$', 'moderation.delete_done', name='documents-delete-done'),
#     url(r'^approve/(\d+)/$', 'moderation.approve', name='documents-approve'),
#     url(r'^approved/$', 'moderation.approve_done', name='documents-approve-done'),
# )

# urlpatterns += patterns('',
#     url(r'^cr/(\d+)/(.+)/$', 'django.contrib.contenttypes.views.shortcut',
#         name='documents-url-redirect'),
#

urlpatterns = patterns('sections.views',
    # url(r'^admin/section/update/$', login_required(views.update_section), name="sections_update_section"),
    # url(r'^admin/section/remove/$', login_required(views.remove_section), name="sections_remove_section"),
    # url(r'^admin/section/live-edit/$', login_required(views.SectionLiveEdit.as_view()), name="sections_live-edit"),

    url(r'^admin/sections/editor/$', sections.views.editor.Editor.as_view(), name="sections_editor"),


    url(r'^admin/sections/editor/versions/$', sections.views.version.list),
    url(r'^admin/sections/editor/version/create/$', sections.views.version.create),
    url(r'^admin/sections/editor/version/current/$', sections.views.version.set_current),
    url(r'^admin/sections/editor/version/active/$', sections.views.version.set_active),


    url(r'^admin/sections/editor/pages/$', sections.views.page.list, name="sections_editor_pages"),
    url(r'^admin/sections/editor/pages/reorder/$', sections.views.page.reorder, name="sections_editor_pages_reorder"),
    url(r'^admin/sections/editor/page/update/$', sections.views.page.update, name="sections_editor_page_update"),
    url(r'^admin/sections/editor/page/create/$', sections.views.page.create, name="sections_editor_page_create"),
    url(r'^admin/sections/editor/page/remove/$', sections.views.page.remove, name="sections_editor_page_remove"),



    url(r'^admin/sections/editor/templates/$', sections.views.template.list, name="sections_editor_templates"),
    url(r'^admin/sections/editor/template/update/$',sections.views.template.update,name="sections_editor_template_update"),
    url(r'^admin/sections/editor/template/create/$',sections.views.template.create,name="sections_editor_template_create"),
    url(r'^admin/sections/editor/template/(?P<pk>[\d]+)/remove/$',sections.views.template.remove, name="sections_editor_template_remove"),
    url(r'^admin/sections/editor/template/preview/$', sections.views.template.preview,name="sections_editor_template_preview"),
    url(r'^admin/sections/editor/template/category/update/$', sections.views.template.category_update, name="sections_editor_template_category_update"),
    url(r'^admin/sections/editor/template/category/create/$', sections.views.template.category_create, name="sections_editor_template_category_create"),
    url(r'^admin/sections/editor/template/category/(?P<pk>[\d]+)/remove/$', sections.views.template.category_remove, name="sections_editor_template_category_remove"),


    url(r'^admin/sections/editor/section/(?P<pk>[\d]+)/edit/$',
        login_required(sections.views.section.SectionSave.as_view()),
         name="sections_editor_section_save"
    ),

    url(r'^admin/sections/editor/sections/reorder/$', sections.views.section.reorder, name="sections_editor_sections_reorder"),
    url(r'^admin/sections/editor/section/update/$', sections.views.section.update, name="sections_editor_section_update"),
    url(r'^admin/sections/editor/section/create/$', sections.views.section.create, name="sections_editor_section_create"),
    url(r'^admin/sections/editor/section/remove/$', sections.views.section.remove, name="sections_editor_section_remove"),
    url(r'^admin/sections/editor/section/preview/$', sections.views.section.preview, name="sections_editor_section_preview"),


    url(r'^admin/sections/editor/upload/image/$', login_required(sections.views.element.upload_image), name="sections_editor_upload_image"),



    # url(r'^admin/sections/editor/section/(?P<pk>[\d]+)/$', views.EditorSectionView.as_view(), name="sections_editor_section"),
    # url(r'^admin/sections/editor/page/(?P<pk>[\d]+)/$', login_required(views.EditorPageView.as_view()), name="sections_editor_page"),

    # url(r'^admin/sections/editor/template/screenshot/(?P<hash>\w{10,64})/$', views.template_screenshot, name="sections_editor_template_screenshot"),


    # url(r'^admin/sections/update/$', views.update, name="sections_update"),
    # # url(r'^admin/sections/retrieve/$', views.retrieve, name="sections_retrieve"),

    # url(r'^admin/sections/editor/save/$', views.save_data, name="sections-save"),
    # url(r'^admin/sections/editor/page/open/$', views.page_open, name="sections-page-open"),

    # url(r'^admin/sections/page/load/$', views.page_load, name="sections-page-load"),
    # url(r'^admin/sections/load/$', views.load, name="sections_load"),

    # url(r'^section/template/preview/$', views.section_preview, name="sections_template-preview"),

    url(r'^$', sections.views.page.PageDefaultView.as_view(), name="sections_page-view-default"),
    url(r'^(?P<pk>[\d]+)/(?P<slug>[-_\w]*)$', sections.views.page.PageView.as_view(), name="sections_page-view"),
)