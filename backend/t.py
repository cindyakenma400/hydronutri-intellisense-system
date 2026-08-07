import requests
s=requests.Session()
s.trust_env=False
print("OK", s.get("http://127.0.0.1:8000", timeout=5).status_code)
