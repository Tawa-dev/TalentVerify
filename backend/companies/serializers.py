from rest_framework import serializers
from .models import Company, Department

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)
    contact_phone = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    
    class Meta:
        model = Company
        fields = ('id', 'name', 'registration_date', 'registration_number', 
                 'address', 'contact_person', 'contact_phone', 'email', 
                 'employee_count', 'departments', 'created_at', 'updated_at')
        read_only_fields = ('id', 'employee_count', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        departments_data = self.context.get('departments', [])
        company = Company.objects.create(**validated_data)
        
        # Create departments
        for dept_data in departments_data:
            Department.objects.create(company=company, **dept_data)
            
        return company
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.registration_date = validated_data.get('registration_date', instance.registration_date)
        instance.registration_number = validated_data.get('registration_number', instance.registration_number)
        instance.address = validated_data.get('address', instance.address)
        instance.contact_person = validated_data.get('contact_person', instance.contact_person)
        
        # Handle encrypted fields
        if 'contact_phone' in validated_data:
            instance.contact_phone = validated_data.get('contact_phone')
        
        if 'email' in validated_data:
            instance.email = validated_data.get('email')
            
        instance.save()
        
        # Update departments if provided in context
        departments_data = self.context.get('departments')
        if departments_data is not None:
            instance.departments.all().delete()
            for dept_data in departments_data:
                Department.objects.create(company=instance, **dept_data)
                
        return instance