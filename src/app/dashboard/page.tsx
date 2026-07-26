"use client";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";

import KPICard from "@/components/dashboard/KPICards";
import FarmHealthScore from "@/components/dashboard/FarmHealthScore";
import SensorOverview from "@/components/dashboard/SensorOverview";
import DiseaseAlertCard from "@/components/dashboard/DiseaseAlertCard";
import CropRecommendation from "@/components/dashboard/CropRecommendationCard";
import FertilizationStatusCard from "@/components/dashboard/FertilizerStatusCard";
import PumpStatusCard from "@/components/dashboard/PumpStatusCard";
import SystemControl from "@/components/dashboard/SystemControls";

import { useDashboard } from "@/hooks/useDashboard";
import { useSensors } from "@/hooks/useSensors";
import { moistureStatus, phStatus, ecStatus } from "@/utils/calculateStatus";

export default function DashboardPage() {
  const { summary, recommendation, controls, loading, error } = useDashboard();
  const { latest, history } = useSensors();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !summary) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Start the backend and the ESP32 (or the simulator) to see live farm data here."
      />
    );
  }

  const moisture = moistureStatus(summary.soil_moisture);
  const ph = phStatus(summary.soil_ph);
  const ec = ecStatus(latest?.ec ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your smart farm"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <KPICard
          title="Soil Moisture"
          value={`${summary.soil_moisture}%`}
          status={moisture.label}
        />

        <KPICard
          title="pH Level"
          value={`${summary.soil_ph}`}
          status={ph.label}
        />

        <KPICard
          title="EC Level"
          value={`${latest?.ec ?? 0} dS/m`}
          status={ec.label}
        />

        <KPICard
          title="Best Crop"
          value={summary.recommended_crop}
          status={`${recommendation?.confidence ?? 0}% Suitable`}
        />
      </div>

      <FarmHealthScore
        score={recommendation?.confidence ?? 0}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SensorOverview history={history} />
        </div>

        <DiseaseAlertCard />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <CropRecommendation
          crops={recommendation?.ranking ?? []}
        />

        <PumpStatusCard
          irrigationStatus={summary.irrigation_status}
          autoMode={controls?.auto_mode ?? true}
          manualPumpOn={controls?.pump_on ?? false}
        />

        <FertilizationStatusCard
          nitrogen={summary.nitrogen}
          phosphorus={summary.phosphorus}
          potassium={summary.potassium}
        />
      </div>

      <SystemControl />
    </div>
  );
}