from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from customers.views import CustomerViewSet
from tasks.views import TaskViewSet
from notifications.views import NotificationViewSet
from users.views import RegisterView, UserDetailView

# Setup DRF Router
router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth URLs
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='user_detail'),

    # API URLs
    path('api/', include(router.urls)),
]
