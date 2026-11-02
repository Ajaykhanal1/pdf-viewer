from django.urls import path

from .views import (
    AdminLoginView,
    DocumentDetailView,
    DocumentFileView,
    DocumentListView,
    DocumentUploadView,
)

urlpatterns = [
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("documents/", DocumentListView.as_view(), name="document-list"),
    path("documents/upload/", DocumentUploadView.as_view(), name="document-upload"),
    path("documents/<int:pk>/", DocumentDetailView.as_view(), name="document-detail"),
    path(
        "documents/<int:pk>/view/",
        DocumentFileView.as_view(),
        name="document-view",
    ),
]
