from rest_framework import serializers
from .models import Company, Department


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'company']
        read_only_fields = ['id']


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model."""
    
    departments = DepartmentSerializer(many=True, read_only=True)
    # employees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'registration_number', 'registration_date', 
            'address', 'number_of_employees', 'contact_person', 'contact_phone', 'email_address',
            'departments', 'created_at', 'updated_at'
        ]
        # 'employees_count',
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    # def get_employees_count(self, obj):
    #     """Get count of active employees."""
    #     return obj.employees.filter(is_active=True).count()