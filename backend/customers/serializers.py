from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'
