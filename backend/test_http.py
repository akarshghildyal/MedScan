import urllib.request
import urllib.parse
data = urllib.parse.urlencode({'username':'test@example.com', 'password':'password123'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login', data=data)
try:
    urllib.request.urlopen(req)
except Exception as e:
    print("HTTP ERROR:", getattr(e, 'code', 'Unknown'), e.read().decode())
