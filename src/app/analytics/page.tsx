"use client";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";

import MoistureChart from "@/components/analytics/MoistureChart";
import PHChart from "@/components/analytics/PHChart";
import ECChart from "@/components/analytics/ECChart";
import NPKChart from "@/components/analytics/NPKChart";

import { useSensors } from "@/hooks/useSensors";

export default function AnalyticsPage() {
  const { history, loading, error } = useSensors(10000);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || history.length === 0) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Upload sensor readings first, then historical trends will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Historical trends and farm performance insights"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <MoistureChart history={history} />
        <PHChart history={history} />
        <ECChart history={history} />
        <NPKChart history={history} />
      </div>
    </div>
  );
}