from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, FollowUp
from notifications.models import Notification
from customers.models import ActivityLog

@receiver(post_save, sender=FollowUp)
def auto_update_task_status_on_followup(sender, instance, created, **kwargs):
    """
    When a FollowUp is created:
    1. Automatically change the task status to 'In Progress' if it was 'Pending'.
    2. Record an ActivityLog under the customer.
    """
    if created:
        task = instance.task
        if task.status == 'Pending':
            task.status = 'In Progress'
            task.save(update_fields=['status'])
            
        if task.customer:
            ActivityLog.objects.create(
                user=instance.executed_by,
                customer=task.customer,
                action_type=f"Follow-Up ({instance.followup_type})",
                metadata_json={
                    "task_title": task.title,
                    "followup_type": instance.followup_type,
                    "outcome": instance.outcome or "No outcome notes recorded"
                }
            )

@receiver(post_save, sender=Task)
def notify_and_log_task_lifecycle(sender, instance, created, **kwargs):
    """
    Track task creation & completion:
    - On creation: logs an ActivityLog for the customer
    - On completion: logs an ActivityLog and sends an in-app Notification to the assignee
    """
    if created and instance.customer:
        ActivityLog.objects.create(
            user=instance.assigned_to,
            customer=instance.customer,
            action_type="Task Created",
            metadata_json={
                "task_title": instance.title,
                "due_date": instance.due_date.isoformat() if instance.due_date else None,
                "priority": instance.priority
            }
        )
    elif not created and instance.status == 'Completed':
        Notification.objects.get_or_create(
            user=instance.assigned_to,
            title="Task Completed ✅",
            message=f"You successfully completed the task: '{instance.title}'."
        )
        if instance.customer:
            ActivityLog.objects.create(
                user=instance.assigned_to,
                customer=instance.customer,
                action_type="Task Completed",
                metadata_json={
                    "task_title": instance.title,
                    "priority": instance.priority
                }
            )
