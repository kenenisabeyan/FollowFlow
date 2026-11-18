from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, FollowUpViewSet

app_name = 'tasks'

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'followups', FollowUpViewSet, basename='followup')

urlpatterns = [
    path('', include(router.urls)),
]
