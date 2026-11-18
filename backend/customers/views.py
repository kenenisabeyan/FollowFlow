from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
import csv

from .models import Customer, ActivityLog
from .serializers import CustomerSerializer, ActivityLogSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['company_name', 'contact_name', 'email', 'phone']

    def get_queryset(self):
        return Customer.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Dynamically generates a CSV file of the user's customers.
        """
        queryset = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="customers_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Company Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Created At'])
        
        for customer in queryset:
            writer.writerow([
                customer.company_name,
                customer.contact_name,
                customer.email or '',
                customer.phone or '',
                customer.status,
                customer.created_at.strftime("%Y-%m-%d %H:%M:%S")
            ])
            
        return response

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only audit and activity timeline for customer interactions and events.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['customer', 'action_type']

    def get_queryset(self):
        return ActivityLog.objects.select_related('customer', 'user').filter(
            customer__owner=self.request.user
        ).order_by('-created_at')
