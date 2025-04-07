from django.db import models
from django.utils import timezone
from .encryption import encrypt_field, decrypt_field

class Department(models.Model):
    """
    Department within a company
    """
    name = models.CharField(max_length=100)
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"

class Company(models.Model):
    """
    Company model with encrypted sensitive fields
    """
    name = models.CharField(max_length=200)
    registration_date = models.DateField()
    registration_number = models.CharField(max_length=100)
    address = models.TextField()
    contact_person = models.CharField(max_length=200)
    employee_count = models.PositiveIntegerField(default=0)
    
    # Encrypted fields
    _contact_phone = models.TextField(db_column='contact_phone', blank=True, null=True)
    _email = models.TextField(db_column='email', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    # Property for encrypted contact phone
    @property
    def contact_phone(self):
        return decrypt_field(self._contact_phone) if self._contact_phone else ''
    
    @contact_phone.setter
    def contact_phone(self, value):
        self._contact_phone = encrypt_field(value) if value else None
    
    # Property for encrypted email
    @property
    def email(self):
        return decrypt_field(self._email) if self._email else ''
    
    @email.setter
    def email(self, value):
        self._email = encrypt_field(value) if value else None
    
    def update_employee_count(self):
        """Update the employee count based on active employees"""
        from employees.models import EmployeeRole
        active_roles = EmployeeRole.objects.filter(
            employee__company=self,
            date_left__isnull=True
        ).count()
        self.employee_count = active_roles
        self.save(update_fields=['employee_count'])