from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, FollowUp
from notifications.models import Notification

@receiver(post_save, sender=FollowUp)
def auto_update_task_status_on_followup(sender, instance, created, **kwargs):
    """
    When a FollowUp is created, automatically change the task status 
    to 'In Progress' if it was 'Pending'.
    """
    if created:
        task = instance.task
        if task.status == 'Pending':
            task.status = 'In Progress'
            task.save(update_fields=['status'])

@receiver(post_save, sender=Task)
def notify_on_task_completion(sender, instance, created, **kwargs):
    """
    Automatically notify the assigned user when their task is marked as Completed.
    """
    if not created and instance.status == 'Completed':
        # Only notify if it wasn't already completed (we could add logic to track prev state, but keeping it simple)
        Notification.objects.get_or_create(
            user=instance.assigned_to,
            title="Task Completed \u2705",
            message=f"You successfully completed the task: '{instance.title}'."
        )
