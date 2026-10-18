"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DiseaseResult,
  DiseaseHistoryItem,
} from "@/types/disease";
import {
  analyzeDisease,
  getDiseaseHistory,
  getLatestCapture,
} from "@/services/diseaseService";

export function useDiseaseDetection() {
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [latestCapture, setLatestCapture] = useState<DiseaseHistoryItem | null>(null);
  const [history, setHistory] = useState<DiseaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const items = await getDiseaseHistory();
      setHistory(items);
    } catch {
      // backend not reachable; leave history as is
    }
  }, []);

  const loadLatestCapture = useCallback(async () => {
    try {
      const capture = await getLatestCapture();
      setLatestCapture(capture);
    } catch {
      // backend not reachable
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadLatestCapture();

    const interval = setInterval(loadLatestCapture, 10000);
    return () => clearInterval(interval);
  }, [loadHistory, loadLatestCapture]);

  async function analyze(file: File) {
    setLoading(true);
    try {
      const data = await analyzeDisease(file);
      setResult(data);
      setError(null);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return { result, latestCapture, history, analyze, loading, error, refreshCapture: loadLatestCapture };
}
