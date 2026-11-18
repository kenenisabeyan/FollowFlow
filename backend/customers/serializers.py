from rest_framework import serializers
from .models import Customer, ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.company_name', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'user_name', 'customer', 'customer_name', 'action_type', 'metadata_json', 'created_at')
        read_only_fields = ('user', 'created_at')

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "System"

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['owner']
