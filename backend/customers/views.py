from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.db import transaction
import csv

from .models import Customer, ActivityLog
from .serializers import CustomerSerializer, ActivityLogSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    """
    Enterprise-ready Customer and Lead Management ViewSet.
    Includes stage advancement, bulk lifecycle operations, and lead audit analytics.
    """
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['company_name', 'contact_name', 'email', 'phone']
    ordering_fields = ['created_at', 'lead_value', 'company_name']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Customer.objects.select_related('owner')
        # If user is admin or manager, they can view all company records, else personal
        if getattr(user, 'role', 'ADMIN') in ['ADMIN', 'MANAGER'] and getattr(user, 'is_staff', False):
            return qs.order_by('-created_at')
        return qs.filter(owner=user).order_by('-created_at')

    def perform_create(self, serializer):
        with transaction.atomic():
            customer = serializer.save(owner=self.request.user)
            ActivityLog.objects.create(
                user=self.request.user,
                customer=customer,
                action_type="CUSTOMER_CREATED",
                metadata_json={
                    "company_name": customer.company_name,
                    "lead_value": float(customer.lead_value or 0),
                    "status": customer.status
                }
            )

    def perform_update(self, serializer):
        with transaction.atomic():
            old_instance = self.get_object()
            old_status = old_instance.status
            customer = serializer.save()
            if old_status != customer.status:
                ActivityLog.objects.create(
                    user=self.request.user,
                    customer=customer,
                    action_type="STATUS_CHANGED",
                    metadata_json={
                        "from_status": old_status,
                        "to_status": customer.status
                    }
                )

    @action(detail=True, methods=['post'], url_path='advance-status')
    def advance_status(self, request, pk=None):
        """
        Advances a customer/lead through pipeline stages: New -> Contacted -> Pending -> Closed.
        """
        customer = self.get_object()
        pipeline_sequence = ['New', 'Contacted', 'Pending', 'Closed']
        target_status = request.data.get('status')

        if target_status:
            if target_status not in pipeline_sequence:
                return Response(
                    {"error": f"Invalid status '{target_status}'. Must be one of {pipeline_sequence}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            new_status = target_status
        else:
            try:
                curr_idx = pipeline_sequence.index(customer.status)
                if curr_idx < len(pipeline_sequence) - 1:
                    new_status = pipeline_sequence[curr_idx + 1]
                else:
                    return Response(
                        {"message": "Customer is already in the final 'Closed' stage.", "status": customer.status},
                        status=status.HTTP_200_OK
                    )
            except ValueError:
                new_status = 'Contacted'

        with transaction.atomic():
            old_status = customer.status
            customer.status = new_status
            customer.save(update_fields=['status', 'updated_at'])

            ActivityLog.objects.create(
                user=request.user,
                customer=customer,
                action_type="PIPELINE_ADVANCED",
                metadata_json={"previous_status": old_status, "new_status": new_status}
            )

        return Response({
            "id": customer.id,
            "company_name": customer.company_name,
            "previous_status": old_status,
            "current_status": customer.status,
            "message": f"Pipeline advanced from {old_status} to {new_status}."
        })

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Comprehensive customer 360 summary including task counts and recent activity logs.
        """
        customer = self.get_object()
        tasks = customer.tasks.all()
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='Completed').count()
        pending_tasks = tasks.filter(status='Pending').count()
        overdue_tasks = tasks.filter(status='Overdue').count()

        recent_logs = customer.activity_logs.select_related('user').order_by('-created_at')[:10]
        logs_data = ActivityLogSerializer(recent_logs, many=True).data

        return Response({
            "customer": CustomerSerializer(customer).data,
            "stats": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "pending_tasks": pending_tasks,
                "overdue_tasks": overdue_tasks,
                "total_lead_value": float(customer.lead_value or 0)
            },
            "recent_activity": logs_data
        })

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Safely bulk deletes multiple customer records within an atomic transaction.
        """
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({"error": "A list of 'ids' is required."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            queryset = self.get_queryset().filter(id__in=ids)
            deleted_count, _ = queryset.delete()

        return Response({"message": f"Successfully deleted {deleted_count} customer(s).", "deleted_count": deleted_count})

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Dynamically generates a CSV file of the user's customers.
        """
        queryset = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="customers_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Company Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Lead Value', 'Created At'])
        
        for customer in queryset:
            writer.writerow([
                customer.company_name,
                customer.contact_name,
                customer.email or '',
                customer.phone or '',
                customer.status,
                customer.lead_value or 0.00,
                customer.created_at.strftime("%Y-%m-%d %H:%M:%S")
            ])
            
        return response


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only audit and activity timeline for customer interactions and events.
    Optimized with select_related for non-functional high throughput.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['customer', 'action_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        return ActivityLog.objects.select_related('customer', 'user').filter(
            customer__owner=user
        ).order_by('-created_at')
