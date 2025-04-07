from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q
import csv
import io
import pandas as pd
from .models import Employee, EmployeeRole
from .serializers import EmployeeSerializer, EmployeeRoleSerializer
from companies.models import Company, Department
from users.permissions import IsAdminOrTalentVerifyStaff, IsCompanyAdmin
from django_filters.rest_framework import DjangoFilterBackend

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company']
    search_fields = ['name', 'company__name', 'roles__role', 'roles__department__name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_upload']:
            permission_classes = [IsAdminOrTalentVerifyStaff|IsCompanyAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Employee.objects.all()
        
        # Apply filters from query parameters
        name = self.request.query_params.get('name')
        employer = self.request.query_params.get('employer')
        position = self.request.query_params.get('position')
        department = self.request.query_params.get('department')
        year_started = self.request.query_params.get('year_started')
        year_left = self.request.query_params.get('year_left')
        
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        if employer:
            queryset = queryset.filter(company__name__icontains=employer)
            
        if position:
            queryset = queryset.filter(roles__role__icontains=position)
            
        if department:
            queryset = queryset.filter(roles__department__name__icontains=department)
            
        if year_started:
            queryset = queryset.filter(roles__date_started__year=year_started)
            
        if year_left:
            # Handle current employees (no left date) or left in specific year
            if year_left == 'current':
                queryset = queryset.filter(roles__date_left__isnull=True)
            else:
                queryset = queryset.filter(roles__date_left__year=year_left)
        
        # Admin and Talent Verify staff can see all employees
        if user.is_talent_verify_user:
            return queryset.distinct()
        
        # Company users can only see employees in their company
        if user.company:
            return queryset.filter(company=user.company).distinct()
            
        return Employee.objects.none()
    
    def create(self, request, *args, **kwargs):
        roles_data = request.data.pop('roles', [])
        
        # Ensure company admin can only create for their company
        if not request.user.is_talent_verify_user:
            if request.user.company and request.user.company.id != request.data.get('company'):
                return Response(
                    {'error': 'You can only create employees for your company'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(data=request.data, context={'roles': roles_data})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Process bulk upload of employee data"""
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        company_id = request.data.get('company')
        
        # Ensure company ID is provided
        if not company_id:
            return Response({'error': 'Company ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure company admin can only upload for their company
        if not request.user.is_talent_verify_user:
            if request.user.company and request.user.company.id != int(company_id):
                return Response(
                    {'error': 'You can only upload employees for your company'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Get the company
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Determine file type based on extension
        file_extension = file.name.split('.')[-1].lower()
        
        try:
            with transaction.atomic():
                if file_extension == 'csv':
                    employees = self._process_csv(file, company)
                elif file_extension in ['xls', 'xlsx']:
                    employees = self._process_excel(file, company)
                else:
                    return Response(
                        {'error': 'Unsupported file format. Please upload CSV or Excel file.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                return Response(
                    {'message': f'Successfully processed {len(employees)} employees'},
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _process_csv(self, file, company):
        """Process CSV file for bulk upload"""
        decoded_file = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded_file))
        return self._process_rows(csv_reader, company)
        
    def _process_excel(self, file, company):
        """Process Excel file for bulk upload"""
        df = pd.read_excel(file)
        rows = df.to_dict('records')
        return self._process_rows(rows, company)
    
    def _process_rows(self, rows, company):
        """Process rows of data for employee creation/update"""
        employees = []
        
        for row in rows:
            # Extract employee data
            employee_data = {
                'name': row.get('name'),
                'employee_id': row.get('employee_id', ''),
                'company': company
            }
            
            # Check if employee exists
            employee, created = Employee.objects.update_or_create(
                name=employee_data['name'],
                company=company,
                defaults=employee_data
            )
            
            # Process role if included
            department_name = row.get('department')
            role_name = row.get('role')
            date_started = row.get('date_started')
            date_left = row.get('date_left') if row.get('date_left') not in ['', None] else None
            duties = row.get('duties', '')
            
            if department_name and role_name and date_started:
                # Get or create department
                department, _ = Department.objects.get_or_create(
                    company=company,
                    name=department_name
                )
                
                # Create role
                EmployeeRole.objects.create(
                    employee=employee,
                    department=department,
                    role=role_name,
                    date_started=date_started,
                    date_left=date_left,
                    duties=duties
                )
                
            employees.append(employee)
            
        return employees

class EmployeeRoleViewSet(viewsets.ModelViewSet):
    queryset = EmployeeRole.objects.all()
    serializer_class = EmployeeRoleSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrTalentVerifyStaff|IsCompanyAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = EmployeeRole.objects.all()
        
        # Filter by employee if specified
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        # Admin and Talent Verify staff can see all roles
        if user.is_talent_verify_user:
            return queryset
        
        # Company users can only see roles in their company
        if user.company:
            return queryset.filter(employee__company=user.company)
            
        return EmployeeRole.objects.none()
    
    def create(self, request, *args, **kwargs):
        # Ensure company admin can only create for their company's employees
        if not request.user.is_talent_verify_user:
            employee_id = request.data.get('employee')
            try:
                employee = Employee.objects.get(id=employee_id)
                if employee.company != request.user.company:
                    return Response(
                        {'error': 'You can only create roles for employees in your company'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Ensure department belongs to the same company
                department_id = request.data.get('department')
                department = Department.objects.get(id=department_id)
                if department.company != request.user.company:
                    return Response(
                        {'error': 'Department must belong to the employee\'s company'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (Employee.DoesNotExist, Department.DoesNotExist):
                return Response({'error': 'Invalid employee or department'}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # Similar checks for update
        instance = self.get_object()
        
        if not request.user.is_talent_verify_user:
            if instance.employee.company != request.user.company:
                return Response(
                    {'error': 'You can only update roles for employees in your company'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Check department if being changed
            department_id = request.data.get('department')
            if department_id and int(department_id) != instance.department.id:
                try:
                    department = Department.objects.get(id=department_id)
                    if department.company != request.user.company:
                        return Response(
                            {'error': 'Department must belong to the employee\'s company'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Department.DoesNotExist:
                    return Response({'error': 'Invalid department'}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().update(request, *args, **kwargs)