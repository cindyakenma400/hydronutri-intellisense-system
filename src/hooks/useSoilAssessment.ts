"use client";

import { useCallback, useEffect, useState } from "react";

import { SoilAssessment } from "@/types/crop";
import { CropRecommendation } from "@/types/recommendation";
import { analyzeSoil } from "@/services/soilAssessmentService";
import { getCropRecommendation } from "@/services/recommendationService";

export function useSoilAssessment() {
  const [assessment, setAssessment] = useState<SoilAssessment | null>(null);
  const [recommendation, setRecommendation] =
    useState<CropRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const [soilData, recData] = await Promise.all([
        analyzeSoil(),
        getCropRecommendation(),
      ]);

      setAssessment(soilData);
      setRecommendation(recData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { assessment, recommendation, loading, error, refresh };
}