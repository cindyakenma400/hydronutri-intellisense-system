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
import os
import random
import sys
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


def clamp(value, low, high):
    return max(low, min(high, value))


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


def preflight(session, url):
    """
    Checks the backend is actually up BEFORE streaming readings.

    Nearly every 'backend not reachable' run has one cause: the uvicorn
    terminal is not running. Catching it here gives a clear instruction
    instead of an endless wall of connection errors.
    """
    root = url.split("/sensor")[0]

    try:
        response = session.get(root, timeout=5)
    except requests.exceptions.ConnectionError as error:
        print("\n" + "=" * 58)
        print("CANNOT REACH THE BACKEND")
        print("=" * 58)
        print(f"Nothing answered at {root}")
        print()
        print("Underlying error:")
        print(f"  {error}")
        print()

        # A proxy set in the environment is the usual reason a browser
        # can reach localhost but Python cannot.
        proxies = {
            name: value
            for name, value in os.environ.items()
            if name.upper() in (
                "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY"
            )
        }

        if proxies:
            print("Proxy variables found in your environment:")
            for name, value in proxies.items():
                print(f"  {name} = {value}")
            print()
            print("This simulator already ignores them, so if you still")
            print("see this message the backend itself is not listening.")
            print()

        print("If the backend is not running, open a SEPARATE terminal:")
        print()
        print("    cd C:\\Users\\ASA\\hydronutri-intellisense-system\\backend")
        print("    uvicorn app.main:app --reload")
        print()
        print("Wait for 'Application startup complete', leave that")
        print("terminal open, then run this simulator again.")
        print("=" * 58)
        return False
    except Exception as error:
        print(f"Could not reach {root}: {type(error).__name__}: {error}")
        return False

    print(f"Backend is up at {root} ({response.status_code})")
    return True


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
    failures = 0

    # Reuse one connection for all readings (more reliable on Windows)
    session = requests.Session()

    # Ignore HTTP_PROXY / HTTPS_PROXY from the environment. A proxy set
    # system-wide (VPN, corporate network) makes requests try to route
    # even 127.0.0.1 through it, which fails - while the browser reaches
    # localhost fine because browsers bypass proxies for localhost.
    session.trust_env = False

    if not preflight(session, args.url):
        sys.exit(1)

    print(f"Simulating ESP32 ({args.scenario} soil) -> {args.url}")
    print("Press Ctrl+C to stop.\n")

    while True:
        payload = build_payload(state)

        try:
            response = session.post(args.url, json=payload, timeout=10)

            if response.status_code == 200:
                failures = 0
                print(f"[{sent + 1:>4}] 200 OK  {payload}")
            else:
                # Show the server's own explanation. A 422 lists the
                # rejected field; a 500 carries the traceback.
                failures += 1
                print(f"[{sent + 1:>4}] {response.status_code} REJECTED")
                print(f"       server said: {response.text[:400]}")

        except requests.exceptions.ConnectionError:
            failures += 1
            print(f"[{sent + 1:>4}] Connection lost. Is the backend terminal "
                  f"still running?")
        except Exception as error:
            failures += 1
            print(f"[{sent + 1:>4}] {type(error).__name__}: {error}")

        # Stop nagging if the backend has clearly gone away.
        if failures >= 5:
            print("\nFive failures in a row - stopping.")
            print("Check the backend terminal for an error, then restart it.")
            sys.exit(1)

        sent += 1
        if args.count and sent >= args.count:
            break

        state = drift(state)
        time.sleep(args.interval)

    print(f"\nDone. Sent {sent} readings.")


if __name__ == "__main__":
    main()