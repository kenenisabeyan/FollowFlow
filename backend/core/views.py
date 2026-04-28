from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from customers.models import Customer
from tasks.models import Task
from notifications.models import Notification

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        total_customers = Customer.objects.filter(owner=user).count()
        
        # Task stats
        tasks = Task.objects.filter(assigned_to=user)
        total_tasks = tasks.count()
        pending_tasks = tasks.filter(status='Pending').count()
        in_progress_tasks = tasks.filter(status='In Progress').count()
        completed_tasks = tasks.filter(status='Completed').count()
        overdue_tasks = tasks.filter(status='Overdue').count()

        # Notification stats
        notifications = Notification.objects.filter(user=user)
        unread_notifications = notifications.filter(is_read=False).count()

        return Response({
            "customers": {
                "total": total_customers
            },
            "tasks": {
                "total": total_tasks,
                "pending": pending_tasks,
                "in_progress": in_progress_tasks,
                "completed": completed_tasks,
                "overdue": overdue_tasks
            },
            "notifications": {
                "unread": unread_notifications
            }
        })
