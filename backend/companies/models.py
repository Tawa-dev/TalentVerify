from django.db import models
import uuid
from .encryption import EncryptedCharField, EncryptedEmailField

class Company(models.Model):
    """Company model for storing employer data."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    # Encrypt company registration number as it's sensitive business data
    registration_number = EncryptedCharField(max_length=100, unique=True)
    registration_date = models.DateField()
    address = models.TextField()
    number_of_employees = models.IntegerField()
    contact_person = models.CharField(max_length=255)
    # Encrypt contact information
    contact_phone = EncryptedCharField(max_length=20)
    email_address = EncryptedEmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Department(models.Model):
    """Department model for categorizing employees."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"
