from django.db import models
import uuid
from companies.encryption import EncryptedCharField
from companies.models import Company, Department
from django.conf import settings
from django.utils import timezone


class Employee(models.Model):
    """Employee model for storing employee information."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    employee_id = EncryptedCharField(max_length=50, blank=True, null=True)  # Encrypted for security
    current_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    current_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    current_role = models.CharField(max_length=100)
    date_joined = models.DateField()
    date_left = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.current_company.name})"


class EmployeeRole(models.Model):
    """Model to track employee roles and history."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='roles')
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    duties = models.TextField()
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.employee.name} - {self.title} at {self.company.name}"
    
    def save(self, *args, **kwargs):
        """Override save method to handle current role logic."""
        # If this is a new current role, mark other roles as not current
        if self.is_current:
            EmployeeRole.objects.filter(
                employee=self.employee, 
                is_current=True
            ).exclude(pk=self.pk).update(is_current=False)
            
            # Update the employee's current information
            self.employee.current_company = self.company
            self.employee.current_department = self.department
            self.employee.current_role = self.title
            self.employee.save()
            
        super().save(*args, **kwargs)


class BulkUploadLog(models.Model):
    """Model to track bulk uploads."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    upload_type = models.CharField(max_length=20)  # 'employee' or 'company'
    records_processed = models.IntegerField(default=0)
    records_created = models.IntegerField(default=0)
    records_updated = models.IntegerField(default=0)
    errors = models.IntegerField(default=0)
    error_details = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='processing')  # 'processing', 'completed', 'failed'
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.upload_type} upload by {self.user.email} on {self.created_at}"
    
    def mark_completed(self, records_processed, records_created, records_updated, errors=0, error_details=None):
        """Mark the upload as completed with stats."""
        self.records_processed = records_processed
        self.records_created = records_created
        self.records_updated = records_updated
        self.errors = errors
        self.error_details = error_details
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def mark_failed(self, error_details):
        """Mark the upload as failed with error details."""
        self.status = 'failed'
        self.error_details = error_details
        self.completed_at = timezone.now()
        self.save()
