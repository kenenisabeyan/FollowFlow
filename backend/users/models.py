from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin / Executive'),
        ('MANAGER', 'Operations Manager'),
        ('AGENT', 'Sales & Support Agent'),
    ]

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ADMIN')
    theme_preference = models.CharField(max_length=10, choices=[('light', 'light'), ('dark', 'dark')], default='dark')
    
    def __str__(self):
        return f"{self.username} ({self.role})"
