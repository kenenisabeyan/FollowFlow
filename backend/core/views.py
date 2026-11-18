import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db import connection
from django.db.models import Sum, Count, Q
from django.utils import timezone

from customers.models import Customer
from tasks.models import Task
from notifications.models import Notification

class HealthCheckView(APIView):
    """
    Non-functional observability & resilience endpoint.
    Performs active database ping, latency measurement, and runtime health check.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        t0 = time.time()
        db_healthy = False
        db_latency_ms = None
        db_engine = connection.vendor

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                if row and row[0] == 1:
                    db_healthy = True
                    db_latency_ms = round((time.time() - t0) * 1000, 2)
        except Exception as e:
            return Response({
                "status": "degraded",
                "database": "unhealthy",
                "engine": db_engine,
                "error": str(e),
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({
            "status": "healthy",
            "service": "FollowFlow ERP API",
            "version": "2.1.0",
            "database": {
                "status": "connected",
                "engine": db_engine,
                "latency_ms": db_latency_ms
            },
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    """
    Aggregated business metrics for executive & agent dashboards.
    Optimized with single-pass conditional aggregation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Single-pass conditional aggregation on Customers
        cust_aggregates = Customer.objects.filter(owner=user).aggregate(
            total=Count('id'),
            new=Count('id', filter=Q(status='New')),
            contacted=Count('id', filter=Q(status='Contacted')),
            pending=Count('id', filter=Q(status='Pending')),
            closed=Count('id', filter=Q(status='Closed')),
            pipeline_value=Sum('lead_value')
        )

        # Single-pass conditional aggregation on Tasks
        task_aggregates = Task.objects.filter(assigned_to=user).aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='Pending')),
            in_progress=Count('id', filter=Q(status='In Progress')),
            completed=Count('id', filter=Q(status='Completed')),
            overdue=Count('id', filter=Q(status='Overdue'))
        )

        # Unread notifications count
        unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

        return Response({
            "customers": {
                "total": cust_aggregates['total'] or 0,
                "new": cust_aggregates['new'] or 0,
                "contacted": cust_aggregates['contacted'] or 0,
                "pending": cust_aggregates['pending'] or 0,
                "closed": cust_aggregates['closed'] or 0,
                "pipeline_value": float(cust_aggregates['pipeline_value'] or 0.0),
            },
            "tasks": {
                "total": task_aggregates['total'] or 0,
                "pending": task_aggregates['pending'] or 0,
                "in_progress": task_aggregates['in_progress'] or 0,
                "completed": task_aggregates['completed'] or 0,
                "overdue": task_aggregates['overdue'] or 0,
            },
            "notifications": {
                "unread": unread_notifications
            },
            "user_context": {
                "username": user.username,
                "role": getattr(user, 'role', 'ADMIN'),
            }
        })
