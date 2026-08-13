"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import MoistureGauge from "@/components/irrigation/MoistureGauge";
import PumpIndicator from "@/components/irrigation/PumpIndicator";
import IrrigationRecommendation from "@/components/irrigation/IrrigationRecommendation";

import { IrrigationStatus } from "@/types/sensor";
import { ControlState } from "@/types/dashboard";
import { getIrrigationStatus } from "@/services/irrigationService";
import { getLatestReading } from "@/services/sensorService";
import { apiGet } from "@/lib/api";

export default function IrrigationPage() {
  const [status, setStatus] = useState<IrrigationStatus | null>(null);
  const [controls, setControls] = useState<ControlState | null>(null);
  const [moisture, setMoisture] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [statusData, latest, controlData] = await Promise.all([
          getIrrigationStatus(),
          getLatestReading(),
          apiGet<ControlState>("/controls/status"),
        ]);

        if (!active) return;

        setStatus(statusData);
        setMoisture(latest.soil_moisture);
        setControls(controlData);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !status) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Upload sensor readings first, then irrigation status will appear here."
      />
    );
  }

  const autoMode = controls?.auto_mode ?? true;
  const manualPump = controls?.pump_on ?? false;

  // Manual override always wins. When the pump is manually on, it shows on.
  // Otherwise, if auto mode is enabled, the automation decides.
  const pumpOn = manualPump || (autoMode && status.irrigation_needed);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Irrigation Management"
        description="Monitor soil moisture and irrigation status"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <MoistureGauge moisture={moisture ?? 0} />

        <PumpIndicator
          status={pumpOn ? "ON" : "OFF"}
          mode={autoMode ? "Auto Mode" : "Manual Mode"}
        />
      </div>

      <IrrigationRecommendation status={status} />
    </div>
  );
}