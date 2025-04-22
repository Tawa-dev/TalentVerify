from django.urls import path
from . import views

urlpatterns = [
    path('admin-stats/', views.admin_stats, name='admin-stats'),
    path('company-stats/', views.company_stats, name='company-stats'),
]