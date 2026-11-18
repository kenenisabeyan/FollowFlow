import urllib.request
import json
import time

start = time.time()
try:
    req = urllib.request.Request(
        'https://followflow-6.onrender.com/api/auth/login/',
        data=json.dumps({'username': 'keno', 'password': 'testpassword'}).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    res = urllib.request.urlopen(req, timeout=60)
    print("Status:", res.status)
    print("Body:", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
print("Time taken:", round(time.time() - start, 2), "seconds")
