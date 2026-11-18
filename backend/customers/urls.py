from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, ActivityLogViewSet

app_name = 'customers'

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('', include(router.urls)),
]
