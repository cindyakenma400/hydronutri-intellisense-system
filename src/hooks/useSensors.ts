"use client";

import { useEffect, useState } from "react";

import { SensorReading } from "@/types/sensor";
import {
  getLatestReading,
  getSensorHistory,
} from "@/services/sensorService";

// Refreshes automatically so new ESP32 readings appear live.
export function useSensors(pollMs = 5000) {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [latestData, historyData] = await Promise.all([
          getLatestReading(),
          getSensorHistory(),
        ]);

        if (!active) return;

        setLatest(latestData);
        setHistory(historyData);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, pollMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pollMs]);

  return { latest, history, loading, error };
}