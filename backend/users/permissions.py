from rest_framework import permissions

class IsCompanyUserOrTalentVerify(permissions.BasePermission):
    """
    Permission to allow only company users or talent verify admins.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['company_user', 'talent_verify']


class IsTalentVerify(permissions.BasePermission):
    """
    Permission to allow only talent verify.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'talent_verify'


class IsCompanyUserForCompany(permissions.BasePermission):
    """
    Permission to allow company users to access only their own company.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'talent_verify' or 
            request.user.role == 'company_user'
        )
    
    def has_object_permission(self, request, view, obj):
        # Talent Verify can access any company
        if request.user.role == 'talent_verify':
            return True
        
        # Company users can only access their own company
        return request.user.role == 'company_user' and request.user.company == obj


class IsCompanyUserForEmployee(permissions.BasePermission):
    """
    Permission to allow company users to access only employees of their company.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'talent_verify' or 
            request.user.role == 'company_user'
        )
    
    def has_object_permission(self, request, view, obj):
        # Talent Verify can access any employee
        if request.user.role == 'talent_verify':
            return True
        
        # Company users can only access employees of their company
        return request.user.role == 'company_user' and request.user.company == obj.current_company


class IsAuthenticatedForSearch(permissions.BasePermission):
    """
    Permission to allow any authenticated user to search.
    """
    
    def has_permission(self, request, view):
        # Any authenticated user can search
        return request.user.is_authenticated