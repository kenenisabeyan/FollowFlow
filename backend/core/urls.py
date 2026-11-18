from django.contrib import admin
from django.urls import path, include
from core.views import DashboardStatsView, HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Non-functional Health & Observability
    path('api/health/', HealthCheckView.as_view(), name='api_health'),

    # Auth & User Domain (Decoupled router)
    path('api/auth/', include('users.urls', namespace='users')),

    # Business Analytics
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),

    # Modular Domain Routers
    path('api/', include('customers.urls', namespace='customers')),
    path('api/', include('tasks.urls', namespace='tasks')),
    path('api/', include('notifications.urls', namespace='notifications')),
]
