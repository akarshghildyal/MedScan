import urllib.request
import urllib.parse
import json

data = json.dumps({
    "dob": "2005-03-02",
    "email": "testakarsh@gmail.com",
    "full_name": "Akarsh Testing Account",
    "password": "123456",
    "role": "patient",
    "sex": "male"
}).encode()

req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/register', data=data, headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req)
except Exception as e:
    print("HTTP ERROR:", getattr(e, 'code', 'Unknown'), e.read().decode())
