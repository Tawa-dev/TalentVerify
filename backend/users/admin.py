from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

class CustomUserAdmin(UserAdmin):
    # Fields to display in the list view
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    
    # Fields to use for searching
    search_fields = ('email', 'first_name', 'last_name')
    
    # Fields to use for filtering in the right sidebar
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    
    # Define fieldsets for the "add" form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )
    
    # Define fieldsets for the "change" form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Role information'), {'fields': ('role',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    # The field to use as the username field
    ordering = ('email',)

# Register the User model with our custom admin class
admin.site.register(User, CustomUserAdmin)