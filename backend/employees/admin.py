from django.contrib import admin
from django.utils.html import format_html
from .models import Employee, EmployeeRole, BulkUploadLog
 

class EmployeeRoleInline(admin.TabularInline):
    """Inline admin for employee roles."""
    model = EmployeeRole
    extra = 0
    fields = ('title', 'company', 'department', 'start_date', 'end_date', 'is_current')
    readonly_fields = ('created_at', 'updated_at')
    

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin for Employee model."""
    list_display = ('name', 'employee_id', 'current_company', 'current_department', 
                    'current_role', 'date_joined', 'is_active', 'created_at')
    list_filter = ('is_active', 'current_company', 'current_department', 'date_joined')
    search_fields = ('name', 'employee_id', 'current_role')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'employee_id', 'is_active')
        }),
        ('Current Position', {
            'fields': ('current_company', 'current_department', 'current_role')
        }),
        ('Dates', {
            'fields': ('date_joined', 'date_left', 'created_at', 'updated_at')
        }),
    )
    inlines = [EmployeeRoleInline]


@admin.register(EmployeeRole)
class EmployeeRoleAdmin(admin.ModelAdmin):
    """Admin for EmployeeRole model."""
    list_display = ('employee', 'title', 'company', 'department', 
                    'start_date', 'end_date', 'is_current')
    list_filter = ('is_current', 'company', 'department', 'start_date')
    search_fields = ('employee__name', 'title', 'company__name', 'department__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Employee Information', {
            'fields': ('employee',)
        }),
        ('Role Information', {
            'fields': ('title', 'company', 'department', 'duties')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'is_current')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BulkUploadLog)
class BulkUploadLogAdmin(admin.ModelAdmin):
    """Admin for BulkUploadLog model."""
    list_display = ('file_name', 'upload_type', 'user', 'status', 
                    'records_processed', 'records_created', 'records_updated', 
                    'errors', 'created_at', 'completed_at')
    list_filter = ('status', 'upload_type', 'created_at')
    search_fields = ('file_name', 'user__email')
    readonly_fields = ('id', 'user', 'file_name', 'file_size', 'upload_type',
                      'records_processed', 'records_created', 'records_updated',
                      'errors', 'error_details', 'status', 'created_at', 'completed_at',
                      'formatted_error_details')
    
    def has_add_permission(self, request):
        """Disable add permission for upload logs."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable change permission for upload logs."""
        return False
    
    def formatted_error_details(self, obj):
        """Format error details with HTML for better readability."""
        if not obj.error_details:
            return "-"
        return format_html('<pre style="max-height: 300px; overflow-y: auto;">{}</pre>', obj.error_details)
    
    formatted_error_details.short_description = "Error Details (Formatted)"
    
    fieldsets = (
        ('Upload Information', {
            'fields': ('id', 'file_name', 'file_size', 'upload_type', 'user')
        }),
        ('Status', {
            'fields': ('status', 'created_at', 'completed_at')
        }),
        ('Results', {
            'fields': ('records_processed', 'records_created', 'records_updated', 'errors')
        }),
        ('Error Details', {
            'fields': ('formatted_error_details',),
            'classes': ('collapse',)
        }),
    )