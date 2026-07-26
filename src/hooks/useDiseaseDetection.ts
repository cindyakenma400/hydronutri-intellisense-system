"use client";

import { useEffect, useState } from "react";

import {
  DiseaseResult,
  DiseaseHistoryItem,
} from "@/types/disease";
import {
  analyzeDisease,
  getDiseaseHistory,
} from "@/services/diseaseService";

export function useDiseaseDetection() {
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [history, setHistory] = useState<DiseaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    try {
      const items = await getDiseaseHistory();
      setHistory(items);
    } catch {
      // backend not reachable; leave history as is
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

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

  return { result, history, analyze, loading, error };
}