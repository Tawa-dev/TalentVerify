from django.urls import path, include
from rest_framework.routers import DefaultRouter
from companies.views import DepartmentViewSet
from .views import EmployeeViewSet, EmployeeRoleViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'roles', EmployeeRoleViewSet)
router.register(r'', EmployeeViewSet)

urlpatterns = [
    path('bulk_upload/', EmployeeViewSet.as_view({'post': 'bulk_upload'}), name='employee-bulk-upload'),
    path('search/', EmployeeViewSet.as_view({'get': 'search'}), name='search'),
    path('', include(router.urls)),
]