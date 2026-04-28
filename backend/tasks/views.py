from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Task, FollowUp
from .serializers import TaskSerializer, FollowUpSerializer
from django_filters.rest_framework import DjangoFilterBackend

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'priority', 'customer']
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user).order_by('due_date')

    def perform_create(self, serializer):
        serializer.save(assigned_to=self.request.user)

class FollowUpViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task', 'followup_type']

    def get_queryset(self):
        return FollowUp.objects.filter(executed_by=self.request.user).order_by('-executed_at')

    def perform_create(self, serializer):
        serializer.save(executed_by=self.request.user)
