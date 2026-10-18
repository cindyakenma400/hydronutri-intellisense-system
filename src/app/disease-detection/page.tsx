"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import DiseaseImageViewer from "@/components/disease/DiseaseImageViewer";
import DiseaseResultCard from "@/components/disease/DiseaseResultCard";
import DiseaseHistoryTable from "@/components/disease/DiseaseHistoryTable";
import { useDiseaseDetection } from "@/hooks/useDiseaseDetection";

export default function DiseaseDetectionPage() {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const { result, history, analyze, loading, error } =
    useDiseaseDetection();

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      setImageUrl(URL.createObjectURL(selected));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disease Detection"
        description="AI-powered crop disease identification"
      />

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        Upload a clear close-up photo of a single tomato, maize, or onion
        leaf in good light. The model will automatically detect the crop
        type and identify any disease.
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          <button
            onClick={() => file && analyze(file)}
            disabled={loading || !file}
            className="bg-green-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
          {!file && (
            <span className="text-sm text-gray-500">
              Choose a leaf image first
            </span>
          )}
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner />}

      <div className="grid lg:grid-cols-2 gap-6">
        <DiseaseImageViewer imageUrl={imageUrl} />
        <DiseaseResultCard
          disease={result?.disease_detected ?? "Not analyzed yet"}
          confidence={result?.confidence ?? 0}
          crop={result?.crop}
          treatment={
            result
              ? result.treatment.join(". ") || "No action needed."
              : "Upload a leaf image and click Analyze."
          }
        />
      </div>

      <DiseaseHistoryTable items={history} />
    </div>
  );
}