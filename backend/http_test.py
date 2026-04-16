import json
from urllib import request, error

body = json.dumps({
    'username': 'kene2',
    'email': 'kene2@gmail.com',
    'first_name': 'kene',
    'last_name': 'kena',
    'password': 'kene1234',
}).encode('utf-8')
req = request.Request('http://localhost:8000/api/auth/register/', data=body, headers={'Content-Type': 'application/json'})
try:
    with request.urlopen(req) as r:
        print('status', r.status)
        print('resp', r.read().decode('utf-8'))
except error.HTTPError as e:
    print('status', e.code)
    print('resp', e.read().decode('utf-8'))
except Exception as exc:
    print('error', exc)
