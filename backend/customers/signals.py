from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Customer, ActivityLog

@receiver(post_save, sender=Customer)
def log_customer_activity(sender, instance, created, **kwargs):
    """
    Automatically log an Activity whenever a Customer is created or updated.
    """
    action = 'Created Customer' if created else 'Updated Customer'
    
    # We can infer the user from owner
    ActivityLog.objects.create(
        user=instance.owner,
        customer=instance,
        action_type=action,
        metadata_json={"status": instance.status, "contact": instance.contact_name}
    )
