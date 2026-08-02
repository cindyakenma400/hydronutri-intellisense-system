import requests

payload = {
    "temperature": 28,
    "humidity": 70,
    "soil_moisture": 62,
    "nitrogen": 68,
    "phosphorus": 44,
    "potassium": 58,
    "ph": 6.4,
    "ec": 1.4
}

try:
    r = requests.post(
        "http://127.0.0.1:8000/sensor/upload",
        json=payload,
        timeout=10
    )

    print("Status:", r.status_code)
    print(r.text)

except Exception as e:
    print(e)