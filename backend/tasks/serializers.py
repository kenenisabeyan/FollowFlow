from rest_framework import serializers
from .models import Task, FollowUp
from customers.serializers import CustomerSerializer

class TaskSerializer(serializers.ModelSerializer):
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('assigned_to',)

class FollowUpSerializer(serializers.ModelSerializer):
    executed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = FollowUp
        fields = '__all__'
        read_only_fields = ('executed_by', 'executed_at')
