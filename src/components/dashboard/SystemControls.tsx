"use client";

import { useEffect, useState } from "react";

import { apiGet, apiPost } from "@/lib/api";

interface ControlState {
  pump_on: boolean;
  valve_on: boolean;
  auto_mode: boolean;
}

export default function SystemControl() {
  const [state, setState] = useState<ControlState | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
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

  async function toggle(path: string) {
    setBusy(true);
    try {
      const updated = await apiPost<ControlState>(path);
      setState(updated);
    } catch {
      // backend not reachable; keep current state
    } finally {
      setBusy(false);
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
          onClick={() => toggle("/controls/pump")}
          disabled={busy}
          className={`w-full py-2 rounded-lg text-white transition disabled:opacity-50 ${
            pumpOn ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          Irrigation Pump {pumpOn ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => toggle("/controls/valve")}
          disabled={busy}
          className={`w-full py-2 rounded-lg text-white transition disabled:opacity-50 ${
            valveOn ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          Fertilizer Valve {valveOn ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => toggle("/controls/auto")}
          disabled={busy}
          className={`w-full py-2 rounded-lg text-white transition disabled:opacity-50 ${
            autoOn ? "bg-gray-800" : "bg-gray-400"
          }`}
        >
          Auto Mode {autoOn ? "Enabled" : "Disabled"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Manual pump and valve controls always take effect. Auto mode runs
        the pump from soil moisture when you have not overridden it. The
        ESP32 polls this state to switch the physical relays.
      </p>
    </div>
  );
}