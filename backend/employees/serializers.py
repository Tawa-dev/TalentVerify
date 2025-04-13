from rest_framework import serializers
from .models import Employee, EmployeeRole
from companies.models import Department, Company
from companies.serializers import DepartmentSerializer

class EmployeeRoleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = EmployeeRole
        fields = ('id', 'department', 'department_name', 'role', 'date_started', 
                  'date_left', 'duties', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class EmployeeSerializer(serializers.ModelSerializer):
    roles = EmployeeRoleSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    current_role = serializers.SerializerMethodField()
    current_department = serializers.SerializerMethodField()
    employee_id = serializers.CharField(required=False)
    
    class Meta:
        model = Employee
        fields = ('id', 'name', 'employee_id', 'company', 'company_name', 
                  'roles', 'current_role', 'current_department', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_current_role(self, obj):
        role = obj.current_role
        if role:
            return {
                'id': role.id,
                'role': role.role,
                'department': role.department.name,
                'date_started': role.date_started
            }
        return None
    
    def get_current_department(self, obj):
        department = obj.current_department
        return department.name if department else None
    
    def create(self, validated_data):
        roles_data = self.context.get('roles', [])
        employee = Employee.objects.create(**validated_data)
        
        # Create roles
        for role_data in roles_data:
            # Get department from role data
            department_id = role_data.pop('department')
            department = Department.objects.get(id=department_id)
            
            EmployeeRole.objects.create(
                employee=employee,
                department=department,
                **role_data
            )
            
        return employee
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        
        # Handle encrypted fields
        if 'employee_id' in validated_data:
            instance.employee_id = validated_data.get('employee_id')
            
        # If company is changed (rare but possible)
        if 'company' in validated_data:
            instance.company = validated_data.get('company')
            
        instance.save()
                
        return instance
    
class PublicEmployeeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    current_role = serializers.SerializerMethodField()
    current_department = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        # Exclude employee_id which is sensitive
        fields = ('id', 'name', 'company', 'company_name', 
                  'current_role', 'current_department', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_current_role(self, obj):
        role = obj.current_role
        if role:
            return {
                'id': role.id,
                'role': role.role,
                'department': role.department.name,
                'date_started': role.date_started
            }
        return None
    
    def get_current_department(self, obj):
        department = obj.current_department
        return department.name if department else None