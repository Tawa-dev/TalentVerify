from rest_framework import serializers
from .models import Employee, EmployeeRole, BulkUploadLog

class EmployeeRoleSerializer(serializers.ModelSerializer):
    """Serializer for EmployeeRole model."""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = EmployeeRole
        fields = [
            'id', 'company', 'company_name', 'department', 'department_name', 
            'title', 'start_date', 'end_date', 'duties', 'is_current',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model."""
    
    roles = EmployeeRoleSerializer(many=True, read_only=True)
    current_company_name = serializers.CharField(source='current_company.name', read_only=True)
    current_department_name = serializers.CharField(source='current_department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'employee_id', 'current_company', 'current_company_name',
            'current_department', 'current_department_name', 'current_role', 
            'date_joined', 'date_left', 'is_active', 'roles', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeDetailSerializer(EmployeeSerializer):
    """Extended serializer for detailed employee information."""
    
    roles = EmployeeRoleSerializer(many=True, read_only=True)
    
    class Meta(EmployeeSerializer.Meta):
        fields = EmployeeSerializer.Meta.fields + []


class BulkUploadLogSerializer(serializers.ModelSerializer):
    """Serializer for BulkUploadLog model."""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = BulkUploadLog
        fields = [
            'id', 'user', 'user_email', 'file_name', 'file_size', 'upload_type',
            'records_processed', 'records_created', 'records_updated', 'errors',
            'error_details', 'status', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']