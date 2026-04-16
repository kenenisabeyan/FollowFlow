from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate
from django.db.utils import OperationalError, ProgrammingError


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        post_migrate.connect(self.create_default_users, sender=self)

    def create_default_users(self, sender, **kwargs):
        User = get_user_model()
        try:
            if not User.objects.filter(username='testuser').exists():
                User.objects.create_user(
                    username='testuser',
                    email='test@followflow.com',
                    password='Test1234',
                    first_name='Test',
                    last_name='User',
                )
            if not User.objects.filter(username='admin').exists():
                User.objects.create_user(
                    username='admin',
                    email='admin@followflow.com',
                    password='Admin1234',
                    first_name='Admin',
                    last_name='User',
                )
        except (ProgrammingError, OperationalError):
            # Database is not ready yet, skip user creation.
            pass
