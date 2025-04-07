from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, EmployeeRoleViewSet

router = DefaultRouter()
router.register(r'', EmployeeViewSet)
router.register(r'roles', EmployeeRoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]