import hmac

from django.conf import settings
from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    message = "Admin authentication is required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_staff)


class HasDocumentAccess(BasePermission):
    """Admin token or the shared app key used by the mobile viewer."""

    message = "A valid app key is required."

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated and user.is_staff:
            return True

        supplied = request.headers.get("X-App-Key", "")
        expected = settings.APP_API_KEY
        return bool(supplied) and hmac.compare_digest(supplied, expected)
