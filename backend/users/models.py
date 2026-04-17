from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Optional extended fields
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    theme_preference = models.CharField(max_length=10, choices=[('light', 'light'), ('dark', 'dark')], default='dark')
    
    def __str__(self):
        return self.username
