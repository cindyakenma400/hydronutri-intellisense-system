"use client";

import { useEffect, useState } from "react";

import {
  DashboardSummary,
  ControlState,
} from "@/types/dashboard";
import { CropRecommendation } from "@/types/recommendation";
import { getDashboardSummary } from "@/services/dashboardService";
import { getCropRecommendation } from "@/services/recommendationService";
import { apiGet } from "@/lib/api";

export function useDashboard(pollMs = 5000) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recommendation, setRecommendation] =
    useState<CropRecommendation | null>(null);
  const [controls, setControls] = useState<ControlState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [summaryData, recData, controlData] = await Promise.all([
          getDashboardSummary(),
          getCropRecommendation(),
          apiGet<ControlState>("/controls/status"),
        ]);

        if (!active) return;

        setSummary(summaryData);
        setRecommendation(recData);
        setControls(controlData);
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

  return { summary, recommendation, controls, loading, error };
}