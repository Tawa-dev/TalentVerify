from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model with additional fields and role-based access control
    """
    ROLE_ADMIN = 'admin'
    ROLE_TALENT_VERIFY_STAFF = 'talent_verify_staff'
    ROLE_COMPANY_ADMIN = 'company_admin'
    ROLE_COMPANY_STAFF = 'company_staff'
    
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'System Administrator'),
        (ROLE_TALENT_VERIFY_STAFF, 'Talent Verify Staff'),
        (ROLE_COMPANY_ADMIN, 'Company Administrator'),
        (ROLE_COMPANY_STAFF, 'Company Staff'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_COMPANY_STAFF)
    company = models.ForeignKey(
        'companies.Company', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='users'
    )
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_company_user(self):
        """Check if user is associated with a company"""
        return self.role in [self.ROLE_COMPANY_ADMIN, self.ROLE_COMPANY_STAFF] and self.company is not None
    
    @property
    def is_talent_verify_user(self):
        """Check if user is a Talent Verify staff member"""
        return self.role in [self.ROLE_ADMIN, self.ROLE_TALENT_VERIFY_STAFF]
    
    @property
    def can_manage_company_data(self):
        """Check if user can manage company data"""
        return self.role in [self.ROLE_ADMIN, self.ROLE_TALENT_VERIFY_STAFF, self.ROLE_COMPANY_ADMIN]
    
    @property
    def can_manage_all_companies(self):
        """Check if user can manage all companies"""
        return self.role in [self.ROLE_ADMIN, self.ROLE_TALENT_VERIFY_STAFF]