"""
ESP32 Sensor Simulator
----------------------
Sends realistic, gradually drifting soil sensor readings to the
HydroNutri IntelliSense backend, exactly the way the real ESP32
firmware will (JSON over HTTP POST to /sensor/upload).

Usage:
    python simulate_esp32.py                 # one reading every 5 s
    python simulate_esp32.py --interval 2    # every 2 seconds
    python simulate_esp32.py --count 10      # send 10 readings, then stop
    python simulate_esp32.py --scenario dry  # simulate dry soil
Scenarios: normal | dry | acidic | nutrient_poor | saline
"""

import argparse
import random
import time

import requests

API_URL = "http://127.0.0.1:8000/sensor/upload"

SCENARIOS = {
    "normal": {
        "soil_moisture": 62, "ph": 6.4, "ec": 1.4,
        "nitrogen": 68, "phosphorus": 44, "potassium": 58,
        "temperature": 28, "humidity": 70,
    },
    "dry": {
        "soil_moisture": 22, "ph": 6.3, "ec": 1.2,
        "nitrogen": 60, "phosphorus": 40, "potassium": 52,
        "temperature": 33, "humidity": 45,
    },
    "acidic": {
        "soil_moisture": 58, "ph": 5.1, "ec": 1.3,
        "nitrogen": 62, "phosphorus": 41, "potassium": 55,
        "temperature": 27, "humidity": 68,
    },
    "nutrient_poor": {
        "soil_moisture": 55, "ph": 6.5, "ec": 0.6,
        "nitrogen": 28, "phosphorus": 18, "potassium": 26,
        "temperature": 29, "humidity": 66,
    },
    "saline": {
        "soil_moisture": 60, "ph": 7.2, "ec": 3.6,
        "nitrogen": 70, "phosphorus": 45, "potassium": 60,
        "temperature": 30, "humidity": 64,
    },
}


def drift(state):
    """Applies small random drift so charts look like live data."""
    state["soil_moisture"] = clamp(state["soil_moisture"] + random.uniform(-2.0, 2.0), 5, 95)
    state["ph"] = clamp(state["ph"] + random.uniform(-0.08, 0.08), 3.5, 9.0)
    state["ec"] = clamp(state["ec"] + random.uniform(-0.08, 0.08), 0.1, 5.0)
    state["nitrogen"] = clamp(state["nitrogen"] + random.uniform(-2.5, 2.5), 5, 200)
    state["phosphorus"] = clamp(state["phosphorus"] + random.uniform(-1.5, 1.5), 5, 150)
    state["potassium"] = clamp(state["potassium"] + random.uniform(-2.0, 2.0), 5, 200)
    state["temperature"] = clamp(state["temperature"] + random.uniform(-0.4, 0.4), 15, 45)
    state["humidity"] = clamp(state["humidity"] + random.uniform(-1.5, 1.5), 20, 100)
    return state


def clamp(value, low, high):
    return max(low, min(high, value))


def build_payload(state):
    return {
        "temperature": round(state["temperature"], 1),
        "humidity": round(state["humidity"], 1),
        "soil_moisture": round(state["soil_moisture"], 1),
        "nitrogen": round(state["nitrogen"], 1),
        "phosphorus": round(state["phosphorus"], 1),
        "potassium": round(state["potassium"], 1),
        "ph": round(state["ph"], 2),
        "ec": round(state["ec"], 2),
    }


def main():
    parser = argparse.ArgumentParser(description="ESP32 sensor simulator")
    parser.add_argument("--interval", type=float, default=5.0,
                        help="seconds between readings (default 5)")
    parser.add_argument("--count", type=int, default=0,
                        help="number of readings to send (0 = run forever)")
    parser.add_argument("--scenario", default="normal",
                        choices=sorted(SCENARIOS.keys()),
                        help="soil condition to simulate")
    parser.add_argument("--url", default=API_URL,
                        help="backend upload endpoint")
    args = parser.parse_args()

    state = dict(SCENARIOS[args.scenario])
    sent = 0

    print(f"Simulating ESP32 ({args.scenario} soil) -> {args.url}")
    print("Press Ctrl+C to stop.\n")

    while True:
        payload = build_payload(state)

        try:
            response = requests.post(args.url, json=payload, timeout=5)
            print(f"[{sent + 1:>4}] {response.status_code} {payload}")
        except requests.exceptions.ConnectionError:
            print("Backend not reachable. Is uvicorn running on port 8000?")

        sent += 1
        if args.count and sent >= args.count:
            break

        state = drift(state)
        time.sleep(args.interval)


if __name__ == "__main__":
    main()