import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.test import Client

c = Client()
r = c.post('/api/auth/register/', {
    'username': 'kene',
    'email': 'kene@gmail.com',
    'first_name': 'kene',
    'last_name': 'kena',
    'password': 'kene1234',
})
print('status', r.status_code)
print('content', r.content)
try:
    print('json', json.loads(r.content.decode('utf-8')))
except Exception as exc:
    print('json_error', exc)
