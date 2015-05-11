from django.conf.urls import patterns, url, include
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView


from libs.application import Application
from . import views

from django.contrib.auth.decorators import login_required



class SectionApplication(Application):
    name = 'sections'

    def get_urls(self):
        urlpatterns = super(SectionApplication, self).get_urls()
        urlpatterns += patterns('',

            url(r'^admin/section/update/$', views.update_section, name="update_section"),
            url(r'^admin/section/upload/image/$', views.upload_section_image, name="upload_section_image"),
            url(r'^admin/section/remove/$', views.remove_section, name="remove_section"),
            url(r'^admin/section/live-edit/$', views.SectionLiveEdit.as_view(), name="live-edit"),
            url(r'^section/template/screenshot/(?P<hash>\w{10,64})/$', views.Screenshot.as_view(), name="template-screenshot"),

            url(r'^section/template/preview/$', views.section_preview, name="template-preview"),

            url(r'^(?P<pk>[\d]+)/(?P<slug>[-_\w]*)$', views.PageView.as_view(), name="page-view"),

        )
        return self.post_process_urls(urlpatterns)


    def get_url_decorator(self, url_name):
        print url_name
        if url_name == 'screenshot':
            return None
        return login_required


application = SectionApplication()
