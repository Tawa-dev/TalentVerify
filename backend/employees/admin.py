from django.contrib import admin
from .models import Employee, EmployeeRole

class EmployeeRoleInline(admin.TabularInline):
    model = EmployeeRole
    extra = 1

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'get_current_role', 'get_current_department')
    list_filter = ('company', 'roles__department')
    search_fields = ('name', 'company__name', 'roles__role')
    inlines = [EmployeeRoleInline]
    
    def get_current_role(self, obj):
        current = obj.current_role
        return current.role if current else None
    get_current_role.short_description = 'Current Role'
    
    def get_current_department(self, obj):
        department = obj.current_department
        return department.name if department else None
    get_current_department.short_description = 'Current Department'

@admin.register(EmployeeRole)
class EmployeeRoleAdmin(admin.ModelAdmin):
    list_display = ('employee', 'role', 'department', 'date_started', 'date_left')
    list_filter = ('department', 'date_started')
    search_fields = ('employee__name', 'role', 'department__name')