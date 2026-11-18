from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from customers.models import Customer
from tasks.models import Task
from notifications.models import Notification

class DashboardStatsView(APIView):
    """
    High-performance aggregated business metrics for the executive & agent dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Customers & Lead Pipeline
        customer_qs = Customer.objects.filter(owner=user)
        total_customers = customer_qs.count()
        new_leads = customer_qs.filter(status='New').count()
        contacted_leads = customer_qs.filter(status='Contacted').count()
        pending_leads = customer_qs.filter(status='Pending').count()
        closed_deals = customer_qs.filter(status='Closed').count()
        total_pipeline_value = customer_qs.aggregate(total=Sum('lead_value'))['total'] or 0.0

        # Tasks Metrics
        tasks_qs = Task.objects.filter(assigned_to=user)
        total_tasks = tasks_qs.count()
        pending_tasks = tasks_qs.filter(status='Pending').count()
        in_progress_tasks = tasks_qs.filter(status='In Progress').count()
        completed_tasks = tasks_qs.filter(status='Completed').count()
        overdue_tasks = tasks_qs.filter(status='Overdue').count()

        # Notification Alerts
        unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

        return Response({
            "customers": {
                "total": total_customers,
                "new": new_leads,
                "contacted": contacted_leads,
                "pending": pending_leads,
                "closed": closed_deals,
                "pipeline_value": float(total_pipeline_value),
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
            },
            "user_context": {
                "username": user.username,
                "role": getattr(user, 'role', 'ADMIN'),
            }
        })
