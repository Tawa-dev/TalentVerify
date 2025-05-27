from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date
import pandas as pd
import logging
import io

from .models import Employee, EmployeeRole, BulkUploadLog
from .serializers import EmployeeSerializer, EmployeeRoleSerializer
from users.permissions import IsCompanyUserOrTalentVerify, IsCompanyUserForEmployee
from rest_framework.permissions import IsAuthenticated
from companies.models import Company, Department

logger = logging.getLogger(__name__)

class EmployeeViewSet(viewsets.ModelViewSet):
    """API endpoint for employees."""
    
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsCompanyUserOrTalentVerify]

    def get_permissions(self):
        """Get appropriate permissions for different actions."""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_upload', 'bulk_edit']:
            # Only company users and talent verify can create, update, delete employees
            permission_classes = [IsAuthenticated, IsCompanyUserForEmployee]
        elif self.action in ['search', 'advanced_search']:
            # All authenticated users can access search endpoints
            permission_classes = [IsAuthenticated]
        else:
            # Default view permissions
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter employees based on user's company if they are a company user."""
        queryset = Employee.objects.all()
        if self.request.user.role == 'company_user':
            queryset = queryset.filter(current_company=self.request.user.company)
        return queryset
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search employees by various criteria.
        
        Query parameters:
        - name: Filter by employee name
        - company: Filter by company name
        - role: Filter by job title/position
        - department: Filter by department name
        - start_year: Filter by year started (employees who joined on or after this year)
        - end_year: Filter by year left (employees who left on or before this year)
        - query: General search across name, company, role, department, and employee_id
        """
        # Get base queryset (already filtered by user's company if applicable)
        queryset = self.get_queryset()
        
        # Get search parameters
        query = request.query_params.get('query', '')
        name = request.query_params.get('name', '')
        company = request.query_params.get('company', '')
        role = request.query_params.get('role', '')
        department = request.query_params.get('department', '')
        start_year = request.query_params.get('start_year', '')
        end_year = request.query_params.get('end_year', '')
        
        # Apply filters based on parameters
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(employee_id__icontains=query) |
                Q(current_company__name__icontains=query) |
                Q(current_department__name__icontains=query) |
                Q(current_role__icontains=query)
            )
        
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        if company:
            queryset = queryset.filter(current_company__name__icontains=company)
        
        if department:
            queryset = queryset.filter(current_department__name__icontains=department)
        
        if role:
            queryset = queryset.filter(current_role__icontains=role)
        
        if start_year:
            try:
                start_year_int = int(start_year)
                queryset = queryset.filter(date_joined__year__gte=start_year_int)
            except ValueError:
                pass
        
        if end_year:
            try:
                end_year_int = int(end_year)
                queryset = queryset.filter(
                    Q(date_left__year__lte=end_year_int) |
                    Q(date_left__isnull=True)
                )
            except ValueError:
                pass
        
        # Use the viewset's serializer to maintain consistency
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['post'])
    def advanced_search(self, request):
        """
        Advanced search for employees with history-based criteria.
        
        Accepts JSON body with search parameters:
        - name: Filter by employee name
        - company: Filter by current or past company
        - role: Filter by current or past job title/position
        - department: Filter by current or past department
        - start_date: Filter by start date (YYYY-MM-DD format)
        - end_date: Filter by end date (YYYY-MM-DD format)
        - active: Filter by active status (true/false)
        """
        # Get base queryset (already filtered by user's company if applicable)
        queryset = self.get_queryset()
        
        # Get search parameters from request body
        params = request.data
        
        # Apply filters based on parameters
        if 'name' in params and params['name']:
            queryset = queryset.filter(name__icontains=params['name'])
        
        if 'company' in params and params['company']:
            queryset = queryset.filter(
                Q(current_company__name__icontains=params['company']) |
                Q(roles__company__name__icontains=params['company'])
            ).distinct()
        
        if 'department' in params and params['department']:
            queryset = queryset.filter(
                Q(current_department__name__icontains=params['department']) |
                Q(roles__department__name__icontains=params['department'])
            ).distinct()
        
        if 'role' in params and params['role']:
            queryset = queryset.filter(
                Q(current_role__icontains=params['role']) |
                Q(roles__title__icontains=params['role'])
            ).distinct()
        
        if 'start_date' in params and params['start_date']:
            start_date = parse_date(params['start_date'])
            if start_date:
                queryset = queryset.filter(
                    Q(date_joined__gte=start_date) |
                    Q(roles__start_date__gte=start_date)
                ).distinct()
        
        if 'end_date' in params and params['end_date']:
            end_date = parse_date(params['end_date'])
            if end_date:
                queryset = queryset.filter(
                    Q(date_left__lte=end_date) |
                    Q(roles__end_date__lte=end_date)
                ).distinct()
        
        if 'active' in params:
            is_active = params['active']
            if isinstance(is_active, str):
                is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        # Use the viewset's serializer to maintain consistency
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get employee role history."""
        employee = self.get_object()
        roles = EmployeeRole.objects.filter(employee=employee).order_by('-start_date')
        serializer = EmployeeRoleSerializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_role(self, request, pk=None):
        """Add a new role to employee history."""
        employee = self.get_object()
        
        # Check if user has permission to add role
        if not IsCompanyUserForEmployee().has_object_permission(request, self, employee):
            return Response(
                {'error': 'You do not have permission to add roles for this employee.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EmployeeRoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employee=employee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def bulk_upload(self, request):
        """
        Bulk upload employees from CSV, Excel or text file.
        
        Required columns:
        - name: Employee name
        - role: Current role or job title
        - date_started: Start date in the format YYYY-MM-DD
        
        Optional columns:
        - employee_id: Employee ID (if not provided, will be auto-generated)
        - department: Department name (if doesn't exist, will be created)
        - date_left: End date in the format YYYY-MM-DD (if not provided, employee is considered current)
        - duties: Job duties or description
        """
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Log the upload
        upload_log = BulkUploadLog.objects.create(
            user=request.user,
            file_name=file.name,
            file_size=file.size,
            upload_type='employee'
        )
        
        try:
            # Determine file type and read
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            elif file.name.endswith('.txt'):
                # Try both tab and comma as separators
                try:
                    df = pd.read_csv(file, sep='\t')
                except:
                    df = pd.read_csv(file)
            else:
                upload_log.mark_failed('Unsupported file type')
                return Response(
                    {'error': 'Unsupported file type. Please upload CSV, Excel, or TXT file.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate required columns
            required_columns = ['name', 'role', 'date_started']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                error_msg = f"Missing required columns: {', '.join(missing_columns)}"
                upload_log.mark_failed(error_msg)
                return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)
            
            # Process data
            employees_created = 0
            employees_updated = 0
            errors = 0
            error_details = []
            
            # Get user's company if they are a company user
            user_company = None
            if request.user.role == 'company_user':
                user_company = request.user.company
            
            for index, row in df.iterrows():
                try:
                    with transaction.atomic():
                        # Determine which company to use
                        company = user_company
                        
                        # Company is required
                        if not company:
                            raise Exception("Company user is required for bulk upload")
                        
                        # Get or create department if specified
                        department = None
                        department_name = row.get('department', '').strip() if pd.notna(row.get('department', '')) else None
                        if department_name:
                            department, _ = Department.objects.get_or_create(
                                company=company,
                                name=department_name
                            )
                        
                        # Try to find existing employee by ID or name and company
                        employee = None
                        employee_id = str(row.get('employee_id', '')).strip() if pd.notna(row.get('employee_id', '')) else None
                        
                        if employee_id:
                            try:
                                employee = Employee.objects.get(employee_id=employee_id, current_company=company)
                                employees_updated += 1
                            except Employee.DoesNotExist:
                                pass
                        
                        if not employee and row['name']:
                            try:
                                employee = Employee.objects.get(name=row['name'], current_company=company)
                                employees_updated += 1
                            except Employee.DoesNotExist:
                                # Create new employee
                                employee = Employee.objects.create(
                                    name=row['name'],
                                    employee_id=employee_id,
                                    current_company=company,
                                    current_department=department,
                                    current_role=row['role'],
                                    date_joined=pd.to_datetime(row['date_started']).date()
                                )
                                employees_created += 1
                        
                        # If we found or created an employee, update their role history
                        if employee:
                            # Update employee fields if necessary
                            if pd.notna(row.get('date_left', '')):
                                employee.date_left = pd.to_datetime(row['date_left']).date()
                                employee.is_active = False
                            
                            # Add role to employee history
                            role = EmployeeRole.objects.create(
                                employee=employee,
                                company=company,
                                department=department,
                                title=row['role'],
                                start_date=pd.to_datetime(row['date_started']).date(),
                                end_date=pd.to_datetime(row['date_left']).date() if pd.notna(row.get('date_left', '')) else None,
                                duties=row.get('duties', '') if pd.notna(row.get('duties', '')) else '',
                                is_current=not pd.notna(row.get('date_left', ''))
                            )
                            
                            # Save employee for any field updates
                            employee.save()
                        
                except Exception as e:
                    errors += 1
                    error_details.append(f"Error in row {index+1}: {str(e)}")
                    logger.error(f"Error processing employee row {index+1}: {str(e)}")
            
            # Update log with results
            upload_log.mark_completed(
                records_processed=len(df),
                records_created=employees_created,
                records_updated=employees_updated,
                errors=errors,
                error_details='\n'.join(error_details) if error_details else None
            )
            
            return Response({
                'success': True,
                'processed': len(df),
                'created': employees_created,
                'updated': employees_updated,
                'errors': errors,
                'details': 'File processed successfully',
                'error_details': error_details
            })
            
        except Exception as e:
            upload_log.mark_failed(str(e))
            logger.error(f"Bulk employee upload failed: {str(e)}")
            return Response(
                {'error': f'Failed to process file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def bulk_edit(self, request):
        """
        Bulk edit existing employees from CSV, Excel or text file.
        
        Required columns:
        - employee_id: Employee ID to identify the employee
        
        Optional columns (at least one required):
        - name: Updated employee name
        - role: Updated job title
        - department: Updated department name
        - date_left: End date if employee is leaving
        - is_active: Boolean indicating if employee is active
        """
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Log the upload
        upload_log = BulkUploadLog.objects.create(
            user=request.user,
            file_name=file.name,
            file_size=file.size,
            upload_type='employee_edit'
        )
        
        try:
            # Read the file based on its type
            if file.name.endswith('.csv'):
                content = file.read().decode('utf-8-sig')  # Handle BOM if present
                df = pd.read_csv(io.StringIO(content))
            elif file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            elif file.name.endswith('.txt'):
                content = file.read().decode('utf-8-sig')
                try:
                    df = pd.read_csv(io.StringIO(content), sep='\t')  # Try tab-separated
                except:
                    df = pd.read_csv(io.StringIO(content))  # Fall back to comma-separated
            else:
                upload_log.mark_failed('Unsupported file type')
                return Response(
                    {'error': 'Unsupported file type. Please upload CSV, Excel, or TXT file.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate required columns
            if 'employee_id' not in df.columns:
                error_msg = "Missing required column: employee_id"
                upload_log.mark_failed(error_msg)
                return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)
            
            # Process data
            employees_updated = 0
            roles_added = 0
            errors = 0
            error_details = []
            
            # Get user's company if they are a company user
            user_company = None
            if request.user.role == 'company_user':
                user_company = request.user.company
            
            # Get all employees for this company
            if user_company:
                employees = {str(e.employee_id): e for e in Employee.objects.filter(current_company=user_company)}
            else:
                employees = {str(e.employee_id): e for e in Employee.objects.all()}
            
            for index, row in df.iterrows():
                try:
                    with transaction.atomic():
                        employee_id = str(row['employee_id']).strip()
                        
                        # Look up employee by ID
                        employee = employees.get(employee_id)
                        
                        if not employee:
                            errors += 1
                            error_details.append(f"Row {index+1}: Employee with ID '{employee_id}' not found")
                            continue
                        
                        # Check if user has permission for this employee's company
                        if request.user.role == 'company_user' and request.user.company != employee.current_company:
                            errors += 1
                            error_details.append(f"Row {index+1}: You don't have permission to edit employee with ID '{employee_id}'")
                            continue
                        
                        # Update employee fields if present
                        updated = False
                        new_role_added = False
                        
                        if 'name' in row and pd.notna(row['name']):
                            employee.name = row['name'].strip()
                            updated = True
                        
                        # Handle department change
                        department = None
                        if 'department' in row and pd.notna(row['department']):
                            department_name = row['department'].strip()
                            department, _ = Department.objects.get_or_create(
                                company=employee.current_company,
                                name=department_name
                            )
                            employee.current_department = department
                            updated = True
                        
                        # Handle role change
                        if 'role' in row and pd.notna(row['role']):
                            new_role_title = row['role'].strip()
                            
                            # Only add a new role if it's different
                            if new_role_title != employee.current_role:
                                # First, end the current role
                                current_roles = EmployeeRole.objects.filter(
                                    employee=employee, 
                                    is_current=True
                                )
                                
                                for current_role in current_roles:
                                    current_role.is_current = False
                                    current_role.end_date = timezone.now().date()
                                    current_role.save()
                                
                                # Create new role
                                start_date = pd.to_datetime(row['start_date']).date() if 'start_date' in row and pd.notna(row['start_date']) else timezone.now().date()
                                
                                new_role = EmployeeRole.objects.create(
                                    employee=employee,
                                    company=employee.current_company,
                                    department=department or employee.current_department,
                                    title=new_role_title,
                                    start_date=start_date,
                                    end_date=None,
                                    duties=row.get('duties', '') if pd.notna(row.get('duties', '')) else '',
                                    is_current=True
                                )
                                
                                employee.current_role = new_role_title
                                updated = True
                                new_role_added = True
                                roles_added += 1
                        
                        # Handle employee departure
                        if 'date_left' in row and pd.notna(row['date_left']):
                            date_left = pd.to_datetime(row['date_left']).date()
                            employee.date_left = date_left
                            employee.is_active = False
                            
                            # Update current role end date if we haven't already added a new role
                            if not new_role_added:
                                current_roles = EmployeeRole.objects.filter(
                                    employee=employee, 
                                    is_current=True
                                )
                                
                                for current_role in current_roles:
                                    current_role.is_current = False
                                    current_role.end_date = date_left
                                    current_role.save()
                            
                            updated = True
                        
                        # Handle is_active flag
                        if 'is_active' in row:
                            is_active = pd.notna(row['is_active']) and (
                                row['is_active'] == True or 
                                str(row['is_active']).lower() == 'true' or 
                                str(row['is_active']) == '1'
                            )
                            employee.is_active = is_active
                            updated = True
                        
                        if updated:
                            employee.save()
                            employees_updated += 1
                        
                except Exception as e:
                    errors += 1
                    error_details.append(f"Error in row {index+1}: {str(e)}")
                    logger.error(f"Error processing employee row {index+1}: {str(e)}")
            
            # Update log with results
            upload_log.mark_completed(
                records_processed=len(df),
                records_created=0,
                records_updated=employees_updated,
                errors=errors,
                error_details='\n'.join(error_details) if error_details else None
            )
            
            return Response({
                'success': True,
                'processed': len(df),
                'updated': employees_updated,
                'roles_added': roles_added,
                'errors': errors,
                'details': 'File processed successfully',
                'error_details': error_details
            })
            
        except Exception as e:
            upload_log.mark_failed(str(e))
            logger.error(f"Bulk employee edit failed: {str(e)}")
            return Response(
                {'error': f'Failed to process file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )