"""
ESP32 Sensor Simulator
----------------------
Sends realistic, gradually drifting soil sensor readings to the
HydroNutri IntelliSense backend, exactly the way the real ESP32
firmware does (JSON over HTTP POST to /sensor/upload).

Like the firmware, it also polls /controls/status and obeys it: while
the pump is ON, simulated soil moisture rises, so auto mode can be
watched switching the pump on and off with no hardware attached.

Each reading is sent on a BRAND NEW connection. Reusing a
requests.Session keeps a socket alive between sends, and on Windows
that idle socket is what gets torn down - the next post then dies with
ConnectionResetError(10054). A fresh connection every 5 seconds costs
nothing on localhost and never hits that.

Usage:
    python simulate_esp32.py                  # one reading every 5 s
    python simulate_esp32.py --scenario dry   # low moisture, for demos
    python simulate_esp32.py --url http://192.168.1.50:8000
    python simulate_esp32.py --device-key SECRET   # if DEVICE_API_KEY is set
Scenarios: normal | dry | acidic
"""

import argparse
import os
import random
import sys
import time

import requests

DEFAULT_URL = "http://127.0.0.1:8000"

# No proxy for any request. A system/VPN proxy makes even 127.0.0.1 try
# to route outward and fail, while the browser reaches localhost fine
# because browsers bypass proxies for localhost.
NO_PROXY = {"http": None, "https": None}

INTERVAL = 5.0
MAX_FAILURES = 10

# Field ranges the dashboard expects. Drift is clamped to these so the
# charts stay in a believable band.
RANGES = {
    "soil_moisture": (20.0, 70.0),
    "temperature": (24.0, 34.0),
    "humidity": (45.0, 85.0),
    "ph": (5.5, 7.5),
    "ec": (0.8, 2.5),
    "nitrogen": (30.0, 90.0),
    "phosphorus": (20.0, 60.0),
    "potassium": (30.0, 80.0),
}

# How far each field may move per cycle.
DRIFT = {
    "soil_moisture": 2.0,
    "temperature": 0.4,
    "humidity": 1.5,
    "ph": 0.08,
    "ec": 0.08,
    "nitrogen": 2.5,
    "phosphorus": 1.5,
    "potassium": 2.0,
}

SCENARIOS = {
    "normal": {
        "soil_moisture": 55.0, "temperature": 28.0, "humidity": 70.0,
        "ph": 6.4, "ec": 1.4,
        "nitrogen": 68.0, "phosphorus": 44.0, "potassium": 58.0,
    },
    # Deliberately parked at the bottom of the moisture band so the
    # backend raises irrigation alerts during a demo.
    "dry": {
        "soil_moisture": 21.0, "temperature": 33.0, "humidity": 46.0,
        "ph": 6.3, "ec": 1.2,
        "nitrogen": 60.0, "phosphorus": 40.0, "potassium": 52.0,
    },
    "acidic": {
        "soil_moisture": 52.0, "temperature": 27.0, "humidity": 68.0,
        "ph": 5.6, "ec": 1.3,
        "nitrogen": 62.0, "phosphorus": 41.0, "potassium": 55.0,
    },
}

DECIMALS = {"ph": 2, "ec": 2}

# Moisture gained per cycle while the pump runs.
PUMP_WATERING_RATE = 3.0


def drift(state, pump_on=False):
    """
    Nudges every field a little, keeping it inside its range. Soil dries
    slowly on its own and gets wetter while the pump runs.
    """
    for field, step in DRIFT.items():
        low, high = RANGES[field]
        moved = state[field] + random.uniform(-step, step)
        if field == "soil_moisture":
            moved += PUMP_WATERING_RATE if pump_on else -0.5
        state[field] = max(low, min(high, moved))
    return state


def build_payload(state):
    return {
        field: round(value, DECIMALS.get(field, 1))
        for field, value in state.items()
    }


def fetch_controls(url, headers):
    """Reads the pump and valve state the dashboard / auto mode set."""
    try:
        response = requests.get(url, timeout=10, proxies=NO_PROXY,
                                headers=headers)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
    return None


def send(url, payload, headers):
    """
    One reading, one connection.

    Connection: close tells the server not to keep the socket around,
    and a per-call requests.post() means nothing is pooled on our side
    either - so there is no stale socket to be reset next cycle.
    """
    return requests.post(
        url,
        json=payload,
        timeout=10,
        proxies=NO_PROXY,
        headers={"Connection": "close", **headers},
    )


def main():
    parser = argparse.ArgumentParser(description="ESP32 sensor simulator")
    parser.add_argument("--scenario", default="normal",
                        choices=sorted(SCENARIOS.keys()),
                        help="soil condition to simulate (default normal)")
    parser.add_argument("--url", default=DEFAULT_URL,
                        help="backend base URL (default %(default)s)")
    parser.add_argument("--device-key",
                        default=os.getenv("DEVICE_API_KEY", ""),
                        help="value for X-Device-Key, if the backend "
                             "sets DEVICE_API_KEY")
    args = parser.parse_args()

    endpoint = args.url.rstrip("/") + "/sensor/upload"
    controls_url = args.url.rstrip("/") + "/controls/status"
    headers = {"X-Device-Key": args.device_key} if args.device_key else {}
    pump_on = False
    valve_on = False
    state = dict(SCENARIOS[args.scenario])

    print("=" * 58)
    print("SIMULATOR RUNNING")
    print("=" * 58)
    print(f"Scenario : {args.scenario}")
    print(f"Endpoint : {endpoint}")
    print(f"Interval : {INTERVAL:g}s   (fresh connection per reading)")
    print("Press Ctrl+C to stop.")
    print("=" * 58)

    sent = 0
    failures = 0

    try:
        while True:
            sent += 1
            payload = build_payload(state)

            try:
                response = send(endpoint, payload, headers)

                if response.status_code == 200:
                    failures = 0
                    print(f"[{sent:>4}] 200 OK  {payload}")
                else:
                    # Show the server's own explanation: a 422 names the
                    # rejected field, a 500 carries the traceback.
                    failures += 1
                    print(f"[{sent:>4}] {response.status_code} "
                          f"{response.reason or 'ERROR'}  "
                          f"{response.text[:300]}")
            except Exception as error:
                failures += 1
                print(f"[{sent:>4}] {type(error).__name__}: {error}")

            if failures >= MAX_FAILURES:
                print()
                print(f"Stopping: {MAX_FAILURES} failures in a row.")
                print(f"Check that the backend is running and serving "
                      f"{args.url} - in a separate terminal:")
                print("    uvicorn app.main:app --reload")
                sys.exit(1)

            controls = fetch_controls(controls_url, headers)
            if controls is not None:
                if controls["pump_on"] != pump_on:
                    print(f"       Pump  {'ON' if controls['pump_on'] else 'OFF'}"
                          f"  (auto mode {'on' if controls['auto_mode'] else 'off'})")
                if controls["valve_on"] != valve_on:
                    print(f"       Valve {'ON' if controls['valve_on'] else 'OFF'}")
                pump_on = controls["pump_on"]
                valve_on = controls["valve_on"]

            state = drift(state, pump_on)
            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print()
        print(f"Stopped by user. Sent {sent} readings.")


if __name__ == "__main__":
    main()
