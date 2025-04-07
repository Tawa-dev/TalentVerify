from rest_framework import permissions

class IsAdminOrTalentVerifyStaff(permissions.BasePermission):
    """
    Permission to only allow admins or Talent Verify staff.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_talent_verify_user

class IsCompanyAdmin(permissions.BasePermission):
    """
    Permission to only allow company admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == request.user.ROLE_COMPANY_ADMIN