"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";

import { CropRecommendation } from "@/types/recommendation";
import { getCropRecommendation } from "@/services/recommendationService";

export default function RecommendationsPage() {
  const [data, setData] = useState<CropRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await getCropRecommendation();

        if (!active) return;

        setData(result);
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

  if (error || !data) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Upload sensor readings first, then crop recommendations will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crop Recommendations"
        description="Soil suitability analysis for tomato, onion, and maize"
      />

      <div className="bg-green-700 text-white rounded-xl shadow p-6">
        <p className="text-green-200">Recommended Crop</p>

        <p className="text-4xl font-bold mt-1">
          {data.recommended_crop}
        </p>

        <p className="mt-2 text-green-100">
          {data.message}
        </p>

        <p className="mt-3 text-sm text-green-200">
          Based on: moisture {data.soil_moisture}% · pH {data.soil_ph} ·
          N {data.nitrogen} · P {data.phosphorus} · K {data.potassium} ·
          EC {data.ec} dS/m
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {data.ranking.map((crop) => (
          <div
            key={crop.crop}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                {crop.crop}
              </h2>

              <span className="text-2xl font-bold text-green-700">
                {crop.score}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{ width: `${crop.score}%` }}
              />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-600">
              {crop.suitability}
            </p>

            {crop.suggestions.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  How to improve:
                </p>

                {crop.suggestions.map((tip, index) => (
                  <p
                    key={index}
                    className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                  >
                    {tip}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                Soil conditions are ideal for this crop.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}