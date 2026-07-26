"use client";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import SoilSummaryCard from "@/components/soil/SoilSummaryCard";
import CropRankingCard from "@/components/soil/CropRankingCard";
import SuitabilityTable from "@/components/soil/SuitabilityTable";

import { useSoilAssessment } from "@/hooks/useSoilAssessment";

export default function SoilAssessmentPage() {
  const { assessment, recommendation, loading, error } =
    useSoilAssessment();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !assessment) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Upload sensor readings first, then the soil assessment will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soil Assessment"
        description="Analyze soil conditions and crop suitability"
      />

      <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500">Overall Soil Quality</p>

          <p className="text-3xl font-bold mt-1">
            {assessment.soil_quality}
          </p>

          <p className="text-gray-600 mt-2">
            {assessment.recommendation}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500">Score</p>

          <p className="text-4xl font-bold text-green-700">
            {assessment.soil_score}
          </p>
        </div>
      </div>

      <SoilSummaryCard
        moisture={assessment.soil_moisture}
        ph={assessment.soil_ph}
        nitrogen={assessment.nitrogen}
        phosphorus={assessment.phosphorus}
        potassium={assessment.potassium}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <CropRankingCard
          crops={recommendation?.ranking ?? []}
        />

        <SuitabilityTable
          crops={recommendation?.ranking ?? []}
        />
      </div>
    </div>
  );
}