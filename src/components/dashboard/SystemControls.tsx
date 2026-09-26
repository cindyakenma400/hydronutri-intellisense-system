"use client";

import { useEffect, useRef, useState } from "react";

import { ApiError, apiGet, apiPostJson } from "@/lib/api";

interface ControlState {
  pump_on: boolean;
  valve_on: boolean;
  auto_mode: boolean;
}

export default function SystemControl() {
  const [state, setState] = useState<ControlState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  function setBusyState(value: boolean) {
    busyRef.current = value;
    setBusy(value);
  }

  async function refresh() {
    if (busyRef.current) return;
    try {
      const data = await apiGet<ControlState>("/controls/status");
      setState(data);
    } catch {
      setState(null);
    }
  }

  useEffect(() => {
    // Polls an external system; the initial call avoids a blank UI on first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sends the target state rather than "toggle", so a double click or a
  // retried request cannot flip the pump back to where it started.
  async function setSwitch(path: string, on: boolean) {
    setBusyState(true);
    setError(null);
    try {
      const updated = await apiPostJson<ControlState>(path, { on });
      setState(updated);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Your session has expired. Log in again to use the controls."
          : "Could not reach the controller. Check that the backend is running."
      );
    } finally {
      setBusyState(false);
    }
  }

  const pumpOn = state?.pump_on ?? false;
  const valveOn = state?.valve_on ?? false;
  const autoOn = state?.auto_mode ?? true;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">System Controls</h2>

      <div className="space-y-4 mt-4">
        <button
          onClick={() => setSwitch("/controls/pump", !pumpOn)}
          disabled={busy}
          className={`w-full py-2 rounded-lg text-white transition duration-300 disabled:opacity-50 ${
            pumpOn ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          Irrigation Pump {pumpOn ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => setSwitch("/controls/valve", !valveOn)}
          disabled={busy}
          className={`w-full py-2 rounded-lg text-white transition duration-300 disabled:opacity-50 ${
            valveOn ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          Fertilizer Valve {valveOn ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => setSwitch("/controls/auto", !autoOn)}
          disabled={busy}
          className={`w-full py-2 rounded-lg text-white transition duration-300 disabled:opacity-50 ${
            autoOn ? "bg-gray-800" : "bg-gray-400"
          }`}
        >
          Auto Mode {autoOn ? "Enabled" : "Disabled"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <p className="text-xs text-gray-400 mt-4">
        Auto mode runs the pump from soil moisture, using the trigger and
        maximum runtime in Settings. Switching the pump by hand turns auto
        mode off. The ESP32 polls this state to switch the physical relays.
      </p>
    </div>
  );
}