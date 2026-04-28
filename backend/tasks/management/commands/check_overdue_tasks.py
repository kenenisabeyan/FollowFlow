from django.core.management.base import BaseCommand
from django.utils import timezone
from tasks.models import Task
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Scans the database for overdue tasks and triggers system notifications.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Scanning for overdue tasks...")
        now = timezone.now()
        
        # Find tasks that are past due date but not marked as Completed or Overdue yet
        overdue_tasks = Task.objects.filter(
            due_date__lt=now
        ).exclude(status__in=['Completed', 'Overdue'])
        
        count = overdue_tasks.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No new overdue tasks found.'))
            return

        notifications_to_create = []

        for task in overdue_tasks:
            # Update the status to Overdue
            task.status = 'Overdue'
            task.save(update_fields=['status'])
            
            # Prepare notification
            notifications_to_create.append(
                Notification(
                    user=task.assigned_to,
                    title="Task Overdue \u26a0\ufe0f",
                    message=f"The task '{task.title}' is now overdue! Please check your dashboard."
                )
            )

        # Bulk create notifications efficiently
        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} tasks to Overdue and sent notifications!'))
