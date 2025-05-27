from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
import pandas as pd
import csv
import io
import logging

from .models import Company, Department
from employees.models import BulkUploadLog
from .serializers import (
    CompanySerializer, DepartmentSerializer
)
from users.models import User
from users.serializers import UserSerializer
from users.permissions import (
    IsCompanyUserOrTalentVerify, IsTalentVerify, 
    IsCompanyUserForCompany, IsCompanyUserForEmployee
)

logger = logging.getLogger(__name__)

class CompanyViewSet(viewsets.ModelViewSet):
    """API endpoint for companies."""
    
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name']
    search_fields = ['name', 'address', 'contact_person']
    ordering_fields = ['name', 'registration_date', 'created_at']
    
    def get_permissions(self):
        """Get appropriate permissions for different actions."""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_upload', 'bulk_edit', 'create_with_user_and_departments']:
            # Only Talent Verify can create, update, delete companies
            permission_classes = [permissions.IsAuthenticated, IsTalentVerify]
        else:
            # Company users and Talent Verify can view companies
            permission_classes = [permissions.IsAuthenticated, IsCompanyUserOrTalentVerify]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'])
    def create_user_and_company(self, request):
        """
        Create a company, company user, and departments in a single request.
        Only talent_verify users can access this endpoint.
        
        Expected data format:
        {
            "company": {
                "name": "Company Name",
                "registration_number": "REG123",
                ...other company fields
            },
            "departments": [
                {"name": "Department 1"},
                {"name": "Department 2"}
            ],
            "user": {
                "email": "company_user@example.com",
                "password": "password123"
            }
        }
        """
        with transaction.atomic():
            try:
                # 1. Create the company
                company_data = request.data.get('company', {})
                company_serializer = CompanySerializer(data=company_data)
                company_serializer.is_valid(raise_exception=True)
                company = company_serializer.save()
                
                # 2. Create departments
                departments_data = request.data.get('departments', [])
                departments = []
                
                for dept_data in departments_data:
                    dept_data['company'] = company.id
                    dept_serializer = DepartmentSerializer(data=dept_data)
                    dept_serializer.is_valid(raise_exception=True)
                    department = dept_serializer.save()
                    departments.append(department)
                
                # 3. Create company user
                user_data = request.data.get('user', {})
                user_data['role'] = 'company_user'  # Set role to company_user
                
                user_serializer = UserSerializer(data=user_data)
                user_serializer.is_valid(raise_exception=True)
                user = user_serializer.save()
                
                # 4. Prepare response
                response_data = {
                    'company': company_serializer.data,
                    'departments': DepartmentSerializer(departments, many=True).data,
                    'user': user_serializer.data
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Transaction will be rolled back on exception
                logger.error(f"Error creating company with user and departments: {str(e)}")
                return Response(
                    {'error': f"Failed to create company: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def bulk_upload(self, request):
        """
        Bulk upload new companies from CSV, text, or Excel file.
        Creates a company user for each new company.
        
        Required columns in file:
        - name: Company name
        - registration_number: Unique identifier
        - registration_date: Date of registration (YYYY-MM-DD)
        - address: Company address
        - number_of_employees: Integer count
        - contact_person: Name of contact person
        - contact_phone: Phone number
        - email_address: Company email
        
        Optional columns:
        - departments: Comma-separated list of department names
        - user_email: Email for company user (if not provided, will be derived from company email)
        - user_password: Password for company user (if not provided, a random one will be generated)
        - user_first_name: First name for company user (if not provided, will use contact person name)
        - user_last_name: Last name for company user (if not provided, will be derived from contact person)
        """
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Log the upload
        upload_log = BulkUploadLog.objects.create(
            user=request.user,
            file_name=file.name,
            file_size=file.size,
            upload_type='company_with_user'
        )
        
        try:
            # Determine file type and read
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            elif file.name.endswith('.txt'):
                # Assuming tab-separated or comma-separated values
                try:
                    df = pd.read_csv(file, sep='\t')  # First try tab-separated
                except:
                    df = pd.read_csv(file)  # Fall back to comma-separated
            else:
                upload_log.mark_failed('Unsupported file type')
                return Response(
                    {'error': 'Unsupported file type. Please upload CSV, TXT or Excel file.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process data
            companies_created = 0
            users_created = 0
            skipped_existing = 0
            errors = 0
            error_details = []
            
            # Get all companies first (since we can't filter by encrypted fields directly)
            all_companies = list(Company.objects.all())
            # Create a mapping of registration number to company for easy lookup
            existing_reg_numbers = {comp.registration_number for comp in all_companies}
            # Also check for existing emails to avoid duplicate users
            from users.models import User
            existing_emails = set(User.objects.values_list('email', flat=True))
            
            # Helper function to generate a random password
            def generate_password():
                import string
                import random
                chars = string.ascii_letters + string.digits + "!@#$%^&*()"
                return ''.join(random.choice(chars) for _ in range(12))
            
            # Helper function to split name into first name and last name
            # def split_name(full_name):
            #     parts = full_name.split(maxsplit=1)
            #     if len(parts) == 1:
            #         return parts[0], ""
            #     return parts[0], parts[1]
            
            for index, row in df.iterrows():
                try:
                    with transaction.atomic():
                        registration_number = row['registration_number'].strip() if isinstance(row['registration_number'], str) else row['registration_number']
                        
                        # Check if company already exists
                        if registration_number in existing_reg_numbers:
                            skipped_existing += 1
                            error_details.append(f"Row {index+1}: Company with registration number '{registration_number}' already exists. Use bulk_edit to update existing companies.")
                            continue
                        
                        # Create new company
                        company = Company.objects.create(
                            name=row['name'],
                            registration_number=registration_number,
                            registration_date=pd.to_datetime(row['registration_date']).date(),
                            address=row['address'],
                            number_of_employees=int(row['number_of_employees']),
                            contact_person=row['contact_person'],
                            contact_phone=row['contact_phone'],
                            email_address=row['email_address']
                        )
                        companies_created += 1
                        
                        # Add this new registration number to our set so we don't create duplicates within the same upload
                        existing_reg_numbers.add(registration_number)
                        
                        # Process departments if included
                        if 'departments' in row and pd.notna(row['departments']):
                            departments = str(row['departments']).split(',')
                            for dept_name in departments:
                                dept_name = dept_name.strip()
                                if dept_name:  # Only create non-empty department names
                                    Department.objects.create(company=company, name=dept_name)
                        
                        # Create company user
                        # Determine user email - use specified user_email or derive from company email
                        user_email = row.get('user_email') if pd.notna(row.get('user_email', '')) else row['email_address']
                        
                        # Check if a user with this email already exists
                        if user_email in existing_emails:
                            error_details.append(f"Row {index+1}: User with email '{user_email}' already exists. Company created but no user was created.")
                            continue
                        
                        # Add to existing_emails to prevent duplicates within same upload
                        existing_emails.add(user_email)
                        
                        # Determine user name
                        # if pd.notna(row.get('user_first_name', '')) and pd.notna(row.get('user_last_name', '')):
                        #     first_name = row['user_first_name']
                        #     last_name = row['user_last_name']
                        # else:
                            # Use contact person name or default value
                            # first_name, last_name = split_name(row['contact_person'])
                        
                        # Determine password
                        password = row.get('user_password') if pd.notna(row.get('user_password', '')) else generate_password()
                        
                        # Create user
                        from users.models import User
                        user = User.objects.create_user(
                            email=user_email,
                            password=password,
                            # first_name=first_name,
                            # last_name=last_name,
                            role='company_user',  # Set role to company_user
                            # Add any other required fields
                        )
                        users_created += 1
                    
                        user.company = company
                        user.save()
                except Exception as e:
                    errors += 1
                    error_details.append(f"Error in row {index+1}: {str(e)}")
                    logger.error(f"Error processing company row {index+1}: {str(e)}")
            
            # Update log with results
            upload_log.mark_completed(
                records_processed=len(df),
                records_created=companies_created,
                records_updated=0,  # No updates in this endpoint
                errors=errors,
                error_details='\n'.join(error_details) if error_details else None
            )
            
            return Response({
                'success': True,
                'processed': len(df),
                'companies_created': companies_created,
                'users_created': users_created,
                'skipped_existing': skipped_existing,
                'errors': errors,
                'details': 'File processed successfully',
                'error_details': error_details
            })
            
        except Exception as e:
            upload_log.mark_failed(str(e))
            logger.error(f"Bulk company upload failed: {str(e)}")
            return Response(
                {'error': f'Failed to process file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def bulk_edit(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        companies_updated = 0
        errors = 0
        error_details = []
        
        try:
            # Read the CSV file
            content = file.read().decode('utf-8-sig')  # Handle BOM if present
            df = pd.read_csv(io.StringIO(content))
            
            # Clean registration numbers
            df['registration_number'] = df['registration_number'].str.strip()
            
            # Get all companies first (since we can't filter by encrypted fields directly)
            all_companies = list(Company.objects.all())
            # Create a mapping of registration number to company
            # We need to decrypt the registration numbers from the database
            reg_to_company = {comp.registration_number: comp for comp in all_companies}
            
            for index, row in df.iterrows():
                try:
                    reg_number = row['registration_number']
                    logger.info(f"Processing registration number: '{reg_number}'")
                    
                    # Look up company by reg number in our mapping
                    company = reg_to_company.get(reg_number)
                    
                    if company:
                        logger.info(f"Found company: {company.name}")
                        
                        # Update fields if present
                        if 'name' in row and pd.notna(row['name']):
                            company.name = row['name']
                        if 'number_of_employees' in row and pd.notna(row['number_of_employees']):
                            company.number_of_employees = int(row['number_of_employees'])
                        if 'contact_person' in row and pd.notna(row['contact_person']):
                            company.contact_person = row['contact_person']
                        if 'contact_phone' in row and pd.notna(row['contact_phone']):
                            company.contact_phone = row['contact_phone']
                        if 'email_address' in row and pd.notna(row['email_address']):
                            company.email_address = row['email_address']
                        
                        company.save()
                        companies_updated += 1
                    else:
                        errors += 1
                        # Only show available registration numbers in plain text
                        all_regs = list(reg_to_company.keys())
                        error_details.append(
                            f"Company with registration number '{reg_number}' not found. "
                            f"Available registration numbers: {all_regs}"
                        )
                        
                except Exception as e:
                    errors += 1
                    error_details.append(f"Error in row {index+1}: {str(e)}")
                    logger.error(f"Error processing row {index+1}: {str(e)}")
            
            return Response({
                'success': True,
                'processed': len(df),
                'updated': companies_updated,
                'errors': errors,
                'error_details': error_details
            })
            
        except Exception as e:
            logger.error(f"Bulk edit failed: {str(e)}")
            return Response({
                'error': f'Failed to process file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['put', 'patch'])
    def update_with_departments(self, request, pk=None):
        """
        Update company along with its departments.
        """
        company = self.get_object()
        
        with transaction.atomic():
            try:
                # Update company basic info
                company_data = request.data.get('company', request.data)
                company_serializer = CompanySerializer(company, data=company_data, partial=True)
                company_serializer.is_valid(raise_exception=True)
                company = company_serializer.save()
                
                # Handle departments if provided
                if 'departments' in request.data:
                    departments_data = request.data.get('departments', [])
                    
                    # Delete existing departments for this company
                    Department.objects.filter(company=company).delete()
                    
                    # Create new departments
                    departments = []
                    for dept_data in departments_data:
                        if isinstance(dept_data, dict):
                            dept_name = dept_data.get('name', '').strip()
                        else:
                            dept_name = str(dept_data).strip()
                        
                        if dept_name:  # Only create if name is not empty
                            dept_data_formatted = {
                                'name': dept_name,
                                'company': company.id
                            }
                            dept_serializer = DepartmentSerializer(data=dept_data_formatted)
                            dept_serializer.is_valid(raise_exception=True)
                            department = dept_serializer.save()
                            departments.append(department)
                
                # Prepare response
                response_data = {
                    'company': company_serializer.data,
                    'departments': DepartmentSerializer(departments, many=True).data if 'departments' in request.data else []
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Error updating company with departments: {str(e)}")
                return Response(
                    {'error': f"Failed to update company: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )


            
            

            
            
