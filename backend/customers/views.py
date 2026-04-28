from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
import csv

from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Customer.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Pure Python feature: Dynamically generates a CSV file of the user's customers.
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
