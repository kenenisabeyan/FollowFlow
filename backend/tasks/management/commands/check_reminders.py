import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from tasks.models import Task
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Evaluates tasks and triggers internal reminders/notifications for assignees'

    def handle(self, *args, **options):
        now = timezone.now()
        upcoming_window = now + datetime.timedelta(hours=24)
        
        # Grab active tasks with related customer and assignee
        active_tasks = Task.objects.select_related('assigned_to', 'customer').filter(
            status__in=['Pending', 'In Progress']
        )

        overdue_count = 0
        upcoming_count = 0

        for task in active_tasks:
            assignee = task.assigned_to
            if not assignee:
                continue

            customer_name = task.customer.company_name or task.customer.contact_name or "Client"

            # 1. Overdue Alerts
            if task.due_date < now:
                task.status = 'Overdue'
                task.save(update_fields=['status'])
                overdue_count += 1
                
                title = f"Overdue: {task.title} ⚠️"
                exists = Notification.objects.filter(
                    user=assignee, 
                    title=title
                ).exists()
                
                if not exists:
                    Notification.objects.create(
                        user=assignee,
                        title=title,
                        message=f"Task '{task.title}' for '{customer_name}' was due on {task.due_date.strftime('%b %d, %Y %H:%M')}."
                    )
            
            # 2. Upcoming Reminders (Due within 24 hours)
            elif now < task.due_date <= upcoming_window:
                upcoming_count += 1
                title = f"Upcoming: {task.title} ⏰"
                exists = Notification.objects.filter(
                    user=assignee, 
                    title=title
                ).exists()
                
                if not exists:
                    Notification.objects.create(
                        user=assignee,
                        title=title,
                        message=f"Reminder: Task '{task.title}' for '{customer_name}' is due within 24 hours ({task.due_date.strftime('%b %d, %Y %H:%M')})."
                    )

        self.stdout.write(self.style.SUCCESS(
            f'Processed reminders: {overdue_count} tasks marked overdue, {upcoming_count} upcoming reminders evaluated.'
        ))
