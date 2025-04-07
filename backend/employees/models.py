from django.db import models
from django.utils import timezone
from companies.encryption import encrypt_field, decrypt_field

class Employee(models.Model):
    """
    Employee model with encrypted personal identifiable information
    """
    # Basic information
    name = models.CharField(max_length=200)
    
    # Encrypted employee ID
    _employee_id = models.TextField(db_column='employee_id', blank=True, null=True)
    
    # Company relationship
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='employees')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"
    
    # Property for encrypted employee ID
    @property
    def employee_id(self):
        return decrypt_field(self._employee_id) if self._employee_id else ''
    
    @employee_id.setter
    def employee_id(self, value):
        self._employee_id = encrypt_field(value) if value else None
    
    @property
    def current_role(self):
        """Get the employee's current role"""
        return self.roles.filter(date_left__isnull=True).first()
    
    @property
    def current_department(self):
        """Get the employee's current department"""
        current = self.current_role
        return current.department if current else None
    
    @property
    def role_history(self):
        """Get the employee's role history in chronological order"""
        return self.roles.all().order_by('date_started')

class EmployeeRole(models.Model):
    """
    Model tracking employee roles and history
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='roles')
    department = models.ForeignKey('companies.Department', on_delete=models.CASCADE, related_name='employees')
    role = models.CharField(max_length=200)
    date_started = models.DateField()
    date_left = models.DateField(null=True, blank=True)
    duties = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        status = "Current" if self.date_left is None else f"Until {self.date_left}"
        return f"{self.employee.name} - {self.role} ({status})"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update company employee count when roles change
        self.employee.company.update_employee_count()