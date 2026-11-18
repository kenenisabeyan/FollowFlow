#!/usr/bin/env bash
# exit on error
set -o errexit

if [ -d "backend" ]; then
    cd backend
fi

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Safe initial seed: populate users and accounts if database is brand new
if [ -f "production_seed.json" ]; then
    python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if User.objects.count() == 0:
    from django.core.management import call_command
    print('Fresh database detected. Seeding initial accounts and data...')
    call_command('loaddata', 'production_seed.json')
" || true
fi
