import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

# Self-healing database check: ensure migrations & initial seed are applied
try:
    from django.db import connection
    tables = connection.introspection.table_names()
    if 'users_user' not in tables:
        from django.core.management import call_command
        print("FollowFlow Notice: Fresh database detected. Running migrations...")
        call_command('migrate', interactive=False)
        seed_path = os.path.join(backend_dir, 'production_seed.json')
        if os.path.exists(seed_path):
            print("FollowFlow Notice: Seeding production accounts from fixture...")
            call_command('loaddata', seed_path)
        elif os.path.exists('production_seed.json'):
            call_command('loaddata', 'production_seed.json')
except Exception as e:
    print(f"FollowFlow Migration notice: {e}")

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
application = app
