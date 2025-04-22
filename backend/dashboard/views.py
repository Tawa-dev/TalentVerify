from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from employees.models import Employee, EmployeeRole
from companies.models import Company, Department
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get system-wide statistics for admin dashboard"""
    if not request.user.is_talent_verify_user:
        return Response({"error": "Unauthorized"}, status=403)
    
    # Get last 7 days for recent activity
    last_week = timezone.now() - timedelta(days=7)
    
    stats = {
        "totalCompanies": Company.objects.count(),
        "totalEmployees": Employee.objects.count(),
        "recentUploads": (
            Employee.objects.filter(created_at__gte=last_week).count() +
            Company.objects.filter(created_at__gte=last_week).count()
        ),
        "recentActivity": [
            {
                "action": "New Company Added",
                "details": company.name,
                "timestamp": company.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for company in Company.objects.filter(
                created_at__gte=last_week
            ).order_by('-created_at')[:5]
        ] + [
            {
                "action": "New Employee Added",
                "details": f"{employee.name} at {employee.company.name}",
                "timestamp": employee.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for employee in Employee.objects.filter(
                created_at__gte=last_week
            ).order_by('-created_at')[:5]
        ]
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_stats(request):
    """Get company-specific statistics"""
    if not request.user.company:
        return Response({"error": "No company associated"}, status=400)
    
    company = request.user.company
    last_week = timezone.now() - timedelta(days=7)
    
    # Get departments with employee count
    departments = Department.objects.filter(company=company).values('name')
    department_stats = []
    for dept in departments:
        employee_count = EmployeeRole.objects.filter(
            department__name=dept['name'],
            department__company=company,
            date_left__isnull=True
        ).count()
        department_stats.append({
            "name": dept['name'],
            "employeeCount": employee_count
        })
    
    stats = {
        "totalEmployees": Employee.objects.filter(company=company).count(),
        "departments": department_stats,
        "recentUpdates": Employee.objects.filter(
            company=company,
            updated_at__gte=last_week
        ).count(),
        "recentActivity": [
            {
                "employee": role.employee.name,
                "action": f"Role updated to {role.role}",
                "date": role.updated_at.strftime("%Y-%m-%d")
            }
            for role in EmployeeRole.objects.filter(
                employee__company=company,
                updated_at__gte=last_week
            ).order_by('-updated_at')[:10]
        ]
    }
    
    return Response(stats)