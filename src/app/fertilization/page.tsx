"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import NutrientCard from "@/components/fertilization/NutrientCard";
import NPKChart from "@/components/fertilization/NPKChart";
import FertilizerRecommendation from "@/components/fertilization/FertilizerRecommendation";

import { FertilizationResult } from "@/types/crop";
import { getFertilizerRecommendation } from "@/services/fertilizationService";
import { nutrientStatus } from "@/utils/calculateStatus";

export default function FertilizationPage() {
  const [result, setResult] = useState<FertilizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getFertilizerRecommendation();

        if (!active) return;

        setResult(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !result) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Upload sensor readings first, then fertilizer recommendations will appear here."
      />
    );
  }

  const n = nutrientStatus(result.nitrogen, 50, 60);
  const p = nutrientStatus(result.phosphorus, 40, 50);
  const k = nutrientStatus(result.potassium, 50, 60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fertilization Management"
        description="Monitor nutrient levels and fertilizer recommendations"
      />

      <div className="grid md:grid-cols-3 gap-4">
        <NutrientCard
          nutrient="Nitrogen (N)"
          value={`${result.nitrogen} mg/kg`}
          status={n.label}
        />

        <NutrientCard
          nutrient="Phosphorus (P)"
          value={`${result.phosphorus} mg/kg`}
          status={p.label}
        />

        <NutrientCard
          nutrient="Potassium (K)"
          value={`${result.potassium} mg/kg`}
          status={k.label}
        />
      </div>

      <NPKChart
        nitrogen={result.nitrogen}
        phosphorus={result.phosphorus}
        potassium={result.potassium}
      />

      <FertilizerRecommendation
        recommendations={result.recommendations}
      />
    </div>
  );
}