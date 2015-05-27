from django.conf.urls import patterns, url

from . import views

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
# )

urlpatterns = patterns('sections.views',
    # url(r'^admin/section/update/$', login_required(views.update_section), name="sections_update_section"),
    # url(r'^admin/section/remove/$', login_required(views.remove_section), name="sections_remove_section"),
    # url(r'^admin/section/live-edit/$', login_required(views.SectionLiveEdit.as_view()), name="sections_live-edit"),

    url(r'^admin/sections/editor/$', login_required(views.EditorView.as_view()), name="sections_editor"),

    url(r'^admin/sections/editor/pages/$', login_required(views.editor_pages), name="sections_editor_pages"),
    url(r'^admin/sections/editor/pages/reorder/$', login_required(views.editor_pages_reorder), name="sections_editor_pages_reorder"),
    url(r'^admin/sections/editor/page/update/$', login_required(views.editor_page_update), name="sections_editor_page_update"),
    url(r'^admin/sections/editor/page/create/$', login_required(views.editor_page_create), name="sections_editor_page_create"),
    url(r'^admin/sections/editor/page/remove/$', login_required(views.editor_page_remove), name="sections_editor_page_remove"),

    url(r'^admin/sections/editor/templates/$', login_required(views.editor_templates), name="sections_editor_templates"),
    url(r'^admin/sections/editor/template/update/$', login_required(views.editor_template_update), name="sections_editor_template_update"),
    url(r'^admin/sections/editor/template/create/$', login_required(views.editor_template_create), name="sections_editor_template_create"),
    url(r'^admin/sections/editor/template/remove/$', login_required(views.editor_template_remove), name="sections_editor_template_remove"),
    url(r'^admin/sections/editor/template/preview/$', login_required(views.editor_template_preview), name="sections_editor_template_preview"),

    url(r'^admin/sections/editor/sections/reorder/$', login_required(views.editor_sections_reorder), name="sections_editor_sections_reorder"),
    url(r'^admin/sections/editor/section/update/$', login_required(views.editor_section_update), name="sections_editor_section_update"),
    url(r'^admin/sections/editor/section/create/$', login_required(views.editor_section_create), name="sections_editor_section_create"),
    url(r'^admin/sections/editor/section/remove/$', login_required(views.editor_section_remove), name="sections_editor_section_remove"),
    url(r'^admin/sections/editor/section/preview/$', login_required(views.editor_section_preview), name="sections_editor_section_preview"),


    url(r'^admin/sections/editor/upload/image/$', login_required(views.editor_upload_image), name="sections_editor_upload_image"),





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

    url(r'^(?P<pk>[\d]+)/(?P<slug>[-_\w]*)$', views.PageView.as_view(), name="sections_page-view"),
)