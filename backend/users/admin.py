from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

admin.site.register(User, UserAdmin)
UserAdmin.fieldsets += (('Custom Fields', {'fields': ('role', 'company')}),)