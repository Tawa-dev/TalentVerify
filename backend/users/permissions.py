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
    
class IsAdminOrTalentVerifyStaffOrCompanyAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Return True if user satisfies either permission
        admin_or_staff_perm = IsAdminOrTalentVerifyStaff().has_permission(request, view)
        company_admin_perm = IsCompanyAdmin().has_permission(request, view)
        return admin_or_staff_perm or company_admin_perm
    
class IsCompanyUser(permissions.BasePermission):
    """
    Permission to allow any company user (admin or staff).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_company_user