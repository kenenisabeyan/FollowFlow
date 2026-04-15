from rest_framework import serializers
from .models import Task
from customers.serializers import CustomerSerializer

class TaskSerializer(serializers.ModelSerializer):
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('assigned_to',)
