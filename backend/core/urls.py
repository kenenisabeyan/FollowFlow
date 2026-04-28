from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from customers.views import CustomerViewSet
from tasks.views import TaskViewSet, FollowUpViewSet
from notifications.views import NotificationViewSet
from users.views import RegisterView, UserDetailView, CustomTokenObtainPairView
from core.views import DashboardStatsView

# Setup DRF Router
router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'followups', FollowUpViewSet, basename='followup')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth URLs
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='user_detail'),

    # Analytics
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),

    # API URLs
    path('api/', include(router.urls)),
]
