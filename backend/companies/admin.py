from django.contrib import admin
from .models import Company, Department

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'registration_date', 'number_of_employees', 'contact_person', 'created_at')
    list_filter = ('registration_date', 'created_at')
    search_fields = ('name', 'contact_person', 'address')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'registration_number', 'registration_date', 'address')
        }),
        ('Company Details', {
            'fields': ('number_of_employees',)
        }),
        ('Contact Information', {
            'fields': ('contact_person', 'contact_phone', 'email_address')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'company')
    list_filter = ('company',)
    search_fields = ('name', 'company__name')
    readonly_fields = ('id',)
