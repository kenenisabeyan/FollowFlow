import requests
import time

base_url = "http://localhost:8000/api/"

# 1. Register
uid = int(time.time())
print(f"Testing with unique id: {uid}")
payload = {
    "username": f"testuser_{uid}",
    "email": f"test_{uid}@example.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "User"
}

print("Registering...")
r1 = requests.post(base_url + "auth/register/", json=payload)
print("Register Status:", r1.status_code)
print("Register JSON:", r1.text)

if r1.status_code == 201:
    print("Login...")
    r2 = requests.post(base_url + "auth/login/", json={
        "email": payload["email"],
        "password": payload["password"]
    })
    print("Login Status:", r2.status_code)
    print("Login JSON:", r2.text)
