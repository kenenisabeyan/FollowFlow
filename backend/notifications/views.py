from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """
    High-efficiency notification viewset supporting real-time badge polling,
    bulk-marking, and indexed user notification feeds.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """
        Efficiently marks all unread notifications for the authenticated user as read in a single query.
        """
        updated_count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response(
            {"message": f"Marked {updated_count} notifications as read.", "count": updated_count},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """
        Ultra-lightweight endpoint for client polling/badges without returning full object payloads.
        """
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
