from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
import csv
import io
import pandas as pd
from .models import Company, Department
from .serializers import CompanySerializer, DepartmentSerializer
from users.permissions import IsAdminOrTalentVerifyStaff, IsAdminOrTalentVerifyStaffOrCompanyAdmin, IsCompanyAdmin

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by('name')
    serializer_class = CompanySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_upload']:
            permission_classes = [IsAdminOrTalentVerifyStaff]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin and Talent Verify staff can see all companies
        if user.is_talent_verify_user:
            return Company.objects.all()
        
        # Company users can only see their own company
        if user.company:
            return Company.objects.filter(id=user.company.id)
            
        # Users without a company can't see any
        return Company.objects.none()
    
    def create(self, request, *args, **kwargs):
        departments_data = request.data.pop('departments', [])
        serializer = self.get_serializer(data=request.data, context={'departments': departments_data})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        departments_data = request.data.pop('departments', None)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=partial, 
            context={'departments': departments_data}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Process bulk upload of company data"""
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Determine file type based on extension
        file_extension = file.name.split('.')[-1].lower()
        
        try:
            with transaction.atomic():
                if file_extension == 'csv':
                    companies = self._process_csv(file)
                elif file_extension in ['xls', 'xlsx']:
                    companies = self._process_excel(file)
                elif file_extension == 'txt':
                    companies = self._process_text(file)
                else:
                    return Response(
                        {'error': 'Unsupported file format. Please upload CSV or Excel, or text file.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                return Response(
                    {'message': f'Successfully processed {len(companies)} companies'},
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _process_csv(self, file):
        """Process CSV file for bulk upload"""
        decoded_file = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded_file))
        return self._process_rows(csv_reader)
        
    def _process_excel(self, file):
        """Process Excel file for bulk upload"""
        df = pd.read_excel(file)
        rows = df.to_dict('records')
        return self._process_rows(rows)
    
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
    
    def _process_rows(self, rows):
        """Process rows of data for company creation/update"""
        companies = []
        
        for row in rows:
            # Extract company data
            company_data = {
                'name': row.get('name'),
                'registration_date': row.get('registration_date'),
                'registration_number': row.get('registration_number'),
                'address': row.get('address'),
                'contact_person': row.get('contact_person'),
                'contact_phone': row.get('contact_phone'),
                'email': row.get('email'),
            }
            
            # Clean empty values
            company_data = {k: v for k, v in company_data.items() if v}
            
            # Check if company exists
            company, created = Company.objects.update_or_create(
                registration_number=company_data['registration_number'],
                defaults=company_data
            )
            
            # Process department if included
            if 'department_name' in row and row['department_name']:
                Department.objects.get_or_create(
                    company=company,
                    name=row['department_name']
                )
                
            companies.append(company)
            
        return companies

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrTalentVerifyStaffOrCompanyAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Department.objects.all()
        
        # Filter by company if specified
        company_id = self.request.query_params.get('company')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
            
        # If user is company admin, limit to their company
        if not user.is_talent_verify_user and user.company:
            queryset = queryset.filter(company=user.company)
            
        return queryset