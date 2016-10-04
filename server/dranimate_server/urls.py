from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic.base import TemplateView

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
]

urlpatterns = urlpatterns + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns.append(url(r'^.*(/?)$', TemplateView.as_view(template_name='index.html'), name='home'))
