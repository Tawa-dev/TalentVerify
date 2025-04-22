from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DepartmentViewSet

router = DefaultRouter()
router.register(r'', CompanyViewSet)
router.register(r'departments', DepartmentViewSet)

urlpatterns = [
    path('bulk_upload/', CompanyViewSet.as_view({'post': 'bulk_upload'}), name='company-bulk-upload'),
    path('', include(router.urls)),
    
]