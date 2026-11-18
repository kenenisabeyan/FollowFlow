from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction

from .models import Task, FollowUp
from .serializers import TaskSerializer, FollowUpSerializer
from customers.models import ActivityLog

class TaskViewSet(viewsets.ModelViewSet):
    """
    High-performance Task ViewSet with N+1 elimination via select_related & prefetch_related,
    plus lifecycle actions for completion, batch operations, and overdue detection.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'customer']
    search_fields = ['title', 'description', 'customer__company_name']
    ordering_fields = ['due_date', 'priority', 'created_at']
    ordering = ['due_date']

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related('customer', 'assigned_to').prefetch_related('follow_ups')
        
        # Admins/Managers can see all company tasks if staff, otherwise filter by assigned_to
        if getattr(user, 'role', 'ADMIN') in ['ADMIN', 'MANAGER'] and getattr(user, 'is_staff', False):
            return qs.order_by('due_date')
        return qs.filter(assigned_to=user).order_by('due_date')

    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.save(assigned_to=self.request.user)
            ActivityLog.objects.create(
                user=self.request.user,
                customer=task.customer,
                action_type="TASK_CREATED",
                metadata_json={"task_id": task.id, "title": task.title, "priority": task.priority}
            )

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        """
        Marks a specific task as Completed.
        """
        task = self.get_object()
        with transaction.atomic():
            task.status = 'Completed'
            task.save(update_fields=['status', 'updated_at'])

            ActivityLog.objects.create(
                user=request.user,
                customer=task.customer,
                action_type="TASK_COMPLETED",
                metadata_json={"task_id": task.id, "title": task.title}
            )

        return Response({
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "message": "Task marked as completed successfully."
        })

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        Returns all non-completed tasks past their due date.
        """
        now = timezone.now()
        qs = self.get_queryset().filter(due_date__lt=now).exclude(status='Completed')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='batch-status')
    def batch_status(self, request):
        """
        Updates status for multiple tasks atomically.
        """
        ids = request.data.get('ids', [])
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]

        if not ids or not isinstance(ids, list):
            return Response({"error": "A list of task 'ids' is required."}, status=status.HTTP_400_BAD_REQUEST)
        if new_status not in valid_statuses:
            return Response({"error": f"Invalid status '{new_status}'. Allowed: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            updated_count = self.get_queryset().filter(id__in=ids).update(
                status=new_status,
                updated_at=timezone.now()
            )

        return Response({
            "message": f"Successfully updated {updated_count} task(s) to '{new_status}'.",
            "updated_count": updated_count,
            "status": new_status
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Aggregated task metrics for quick status cards.
        """
        qs = self.get_queryset()
        now = timezone.now()
        return Response({
            "total": qs.count(),
            "pending": qs.filter(status='Pending').count(),
            "in_progress": qs.filter(status='In Progress').count(),
            "completed": qs.filter(status='Completed').count(),
            "overdue": qs.filter(due_date__lt=now).exclude(status='Completed').count(),
            "high_priority": qs.filter(priority='High').exclude(status='Completed').count(),
        })


class FollowUpViewSet(viewsets.ModelViewSet):
    """
    Follow-up logs ViewSet with select_related joins for optimal read performance.
    """
    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task', 'followup_type']
    ordering_fields = ['executed_at']
    ordering = ['-executed_at']

    def get_queryset(self):
        user = self.request.user
        return FollowUp.objects.select_related('task', 'task__customer', 'executed_by').filter(
            executed_by=user
        ).order_by('-executed_at')

    def perform_create(self, serializer):
        with transaction.atomic():
            followup = serializer.save(executed_by=self.request.user)
            ActivityLog.objects.create(
                user=self.request.user,
                customer=followup.task.customer,
                action_type="FOLLOWUP_LOGGED",
                metadata_json={
                    "task_id": followup.task.id,
                    "type": followup.followup_type,
                    "outcome": followup.outcome[:100] if followup.outcome else ""
                }
            )
