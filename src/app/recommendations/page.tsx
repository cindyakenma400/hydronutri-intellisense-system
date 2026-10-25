"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import DateTimeCell from "@/components/shared/DateTimeCell";

import {
  CropRecommendation,
  RecommendationHistoryItem,
} from "@/types/recommendation";
import {
  getCropRecommendation,
  getRecommendationHistory,
} from "@/services/recommendationService";

export default function RecommendationsPage() {
  const [data, setData] = useState<CropRecommendation | null>(null);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        // Fetch the current recommendation first (this records it on the
        // backend), then read the history so the newest entry is included.
        const result = await getCropRecommendation();
        const past = await getRecommendationHistory();

        if (!active) return;

        setData(result);
        setHistory(past);
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

      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-1">
          Recommendation History
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Past recommendations, newest first, with the soil conditions and
          reasons behind each one. A new entry is kept each time the advice
          changes.
        </p>

        {history.length === 0 ? (
          <p className="text-gray-500">
            No past recommendations yet. As soil conditions change, each new
            recommendation will be recorded here.
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-700 text-lg">
                      {item.recommended_crop}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.confidence}% suitable
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 text-right">
                    <DateTimeCell iso={item.created_at} />
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Soil: moisture {item.soil_moisture}% · pH {item.soil_ph} ·
                  N {item.nitrogen} · P {item.phosphorus} · K {item.potassium} ·
                  EC {item.ec} dS/m
                </p>

                {item.limiting_factors.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">
                      Needs attention: {item.limiting_factors.join(", ")}
                    </p>
                    {item.suggestions.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {item.suggestions.map((tip, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                    Soil conditions were ideal for this crop.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}