from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q
import csv
import io
import pandas as pd
from .models import Employee, EmployeeRole
from .serializers import EmployeeSerializer, EmployeeRoleSerializer, PublicEmployeeSerializer
from companies.models import Company, Department
from users.permissions import IsAdminOrTalentVerifyStaff, IsAdminOrTalentVerifyStaffOrCompanyAdmin, IsCompanyAdmin
from django_filters.rest_framework import DjangoFilterBackend

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company']
    search_fields = ['name', 'company__name', 'roles__role', 'roles__department__name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_upload']:
            # Only Talent Verify staff and company admins can modify employee data
            permission_classes = [IsAdminOrTalentVerifyStaff]
        else:
            # But all authenticated users can search/view
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
        
        # Admin and Talent Verify staff can see all employee details
        if user.is_talent_verify_user:
            return queryset.distinct()
        
        # Company users can now see all employee records across companies for searching
        # but with potentially limited sensitive information
        return queryset.distinct()
    
    def create(self, request, *args, **kwargs):
        roles_data = request.data.pop('roles', [])
        
        # Process each role  
        # for role in roles_data:
        #     # Check if department is provided as a name instead of ID
        #     if role.get('department') and not isinstance(role.get('department'), int):
        #         dept_name = role.get('department')
        #         company_id = request.data.get('company')
        #         try:
        #             # Find department by name in this company
        #             department = Department.objects.get(name__iexact=dept_name, company_id=company_id)
        #             role['department'] = department.name
        #         except Department.DoesNotExist:
        #             # Create the department if it doesn't exist
        #             department = Department.objects.create(name=dept_name, company_id=company_id)
        #             role['department'] = department.name
        
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
    
    def _process_rows(self, rows, company):
        """Process rows of data for employee creation/update with department name support"""
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
                # Get or create department by name
                department, _ = Department.objects.get_or_create(
                    company=company,
                    name__iexact=department_name,
                    defaults={'name': department_name}
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
                elif file_extension == 'txt':
                    employees = self._process_text(file, company)
                else:
                    return Response(
                        {'error': 'Unsupported file format. Please upload CSV or Excel, or text file.'},
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
    
    def _process_text(self, file, company):
        """Process plain text file for bulk upload"""
        decoded_file = file.read().decode('utf-8')
        lines = decoded_file.splitlines()
        # Assume tab or comma separated values
        delimiter = '\t' if '\t' in lines[0] else ','
        headers = lines[0].split(delimiter)
        rows = []
        for line in lines[1:]:
            values = line.split(delimiter)
            row = {headers[i]: values[i] for i in range(min(len(headers), len(values)))}
            rows.append(row)
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
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search endpoint with proper response structure"""
        queryset = Employee.objects.all().prefetch_related(
            'roles',
            'roles__department'
        ).select_related('company')
        
        # Apply filters from query parameters
        name = request.query_params.get('name')
        employer = request.query_params.get('employer')
        position = request.query_params.get('position')
        department = request.query_params.get('department')
        year_started = request.query_params.get('year_started')
        year_left = request.query_params.get('year_left')
        
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
            if year_left == 'current':
                queryset = queryset.filter(roles__date_left__isnull=True)
            else:
                queryset = queryset.filter(roles__date_left__year=year_left)

        # Get distinct results
        queryset = queryset.distinct()

        # Use appropriate serializer based on user type
        if request.user.is_talent_verify_user:
            serializer_class = EmployeeSerializer
        else:
            serializer_class = PublicEmployeeSerializer

        serializer = serializer_class(queryset, many=True)
        
        # Transform the data to match frontend expectations
        formatted_results = []
        for employee in serializer.data:
            current_role = employee.get('current_role', {})
            formatted_results.append({
                'id': employee['id'],
                'name': employee['name'],
                'employee_id': employee.get('employee_id', ''),
                'current_company': employee.get('company_name', ''),
                'current_role': current_role.get('role', '') if current_role else '',
                'department': current_role.get('department', '') if current_role else '',
                'roles': [{
                    'company': role.get('company_name', ''),
                    'title': role.get('role', ''),
                    'department': role.get('department_name', ''),
                    'date_started': role.get('date_started', ''),
                    'date_left': role.get('date_left', ''),
                    'duties': role.get('duties', '')
                } for role in employee.get('roles', [])]
            })

        return Response(formatted_results)
    
    @action(detail=False, methods=['get'])
    def edit_template(self, request):
        """Provide template for bulk editing employees"""
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()
        
        # Add headers with formatting
        headers = [
            'employee_id',  # Required for identifying employee
            'name',
            'role',
            'department',
            'date_started',
            'date_left',
            'duties'
        ]
        
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#f4f4f4'
        })
        
        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)
            worksheet.set_column(col, col, 15)
        
        # Add example data
        example_data = [
            'EMP123',
            'John Doe',
            'Software Engineer',
            'Engineering',
            '2023-01-01',
            '2024-01-01',
            'Development and maintenance'
        ]
        
        for col, value in enumerate(example_data):
            worksheet.write(1, col, value)
        
        # Add instructions sheet
        instructions = workbook.add_worksheet('Instructions')
        instructions.write(0, 0, 'Instructions for updating employees:', workbook.add_format({'bold': True}))
        instructions.write(1, 0, '1. employee_id is required to identify the employee')
        instructions.write(2, 0, '2. Only fill in fields you want to update')
        instructions.write(3, 0, '3. Leave fields blank to keep existing values')
        instructions.write(4, 0, '4. Use YYYY-MM-DD format for dates')
        
        workbook.close()
        
        output.seek(0)
        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=employee_edit_template.xlsx'
        
        return response

@action(detail=False, methods=['post'])
def bulk_update(self, request):
    """Process bulk updates of employee data"""
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    file = request.FILES['file']
    file_extension = file.name.split('.')[-1].lower()
    
    try:
        with transaction.atomic():
            if file_extension == 'csv':
                updated = self._process_updates_csv(file, request.user)
            elif file_extension in ['xls', 'xlsx']:
                updated = self._process_updates_excel(file, request.user)
            elif file_extension == 'txt':
                updated = self._process_updates_text(file, request.user)
            else:
                return Response({'error': 'Unsupported file format'}, status=400)
            
            return Response({
                'message': f'Successfully updated {len(updated)} employees',
                'updated': updated
            })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

class EmployeeRoleViewSet(viewsets.ModelViewSet):
    queryset = EmployeeRole.objects.all()
    serializer_class = EmployeeRoleSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrTalentVerifyStaffOrCompanyAdmin]
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
        
        # All authenticated users can now search role history across companies
        return queryset
    
    def get_serializer_class(self):
        user = self.request.user
        
        # Company users viewing their own company's employees get full details
        if user.is_talent_verify_user or (user.company and self.get_object().company == user.company):
            return EmployeeSerializer
        
        # For cross-company viewing, use the limited public serializer
        return PublicEmployeeSerializer
    
    def create(self, request, *args, **kwargs):
        # Check if department is provided as a name instead of ID
        if 'department' in request.data and not isinstance(request.data.get('department'), int):
            dept_name = request.data.get('department')
            
            # Get the company from the employee
            try:
                employee = Employee.objects.get(id=request.data.get('employee'))
                company = employee.company
                
                # Find department by name in this company
                try:
                    department = Department.objects.get(name__iexact=dept_name, company=company)
                    request.data['department'] = department.id
                except Department.DoesNotExist:
                    # Create the department if it doesn't exist
                    department = Department.objects.create(name=dept_name, company=company)
                    request.data['department'] = department.id
            except Employee.DoesNotExist:
                return Response({'error': 'Invalid employee'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure company admin can only create for their company's employees
        if not request.user.is_talent_verify_user:
            # Rest of the code remains the same
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