import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from tasks.models import Task
from notifications.models import Notification
from users.models import User

class Command(BaseCommand):
    help = 'Evaluates tasks and triggers internal reminders/notifications'

    def handle(self, *args, **options):
        now = timezone.now()
        upcoming_window = now + datetime.timedelta(hours=24)
        
        # Grab active tasks
        pending_tasks = Task.objects.filter(status='pending')
        admin_users = User.objects.filter(is_superuser=True)

        if not admin_users.exists():
            self.stdout.write(self.style.WARNING("No admin users to notify."))
            return

        for user in admin_users:
            # 1. Overdue Alerts
            overdue = pending_tasks.filter(due_date__lt=now)
            for task in overdue:
                task.status = 'overdue'
                task.save()
                
                # Check if notification already exists to avoid spam
                exists = Notification.objects.filter(
                    user=user, 
                    title__contains=f"Overdue: {task.title}"
                ).exists()
                
                if not exists:
                    Notification.objects.create(
                        user=user,
                        title=f"Overdue: {task.title}",
                        message=f"Task '{task.title}' for customer '{task.customer.name}' is past its deadline."
                    )
            
            # 2. Upcoming Reminders (Due within 24 hours)
            upcoming = pending_tasks.filter(due_date__gt=now, due_date__lte=upcoming_window)
            for task in upcoming:
                exists = Notification.objects.filter(
                    user=user, 
                    title__contains=f"Upcoming: {task.title}"
                ).exists()
                
                if not exists:
                    Notification.objects.create(
                        user=user,
                        title=f"Upcoming: {task.title}",
                        message=f"Reminder: '{task.title}' is scheduled for {task.due_date.strftime('%b %d, %Y')}."
                    )

        self.stdout.write(self.style.SUCCESS('Successfully processed background reminders.'))
