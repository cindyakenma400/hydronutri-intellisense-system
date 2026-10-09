"use client";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import DataTable from "@/components/shared/DataTable";
import DateTimeCell from "@/components/shared/DateTimeCell";

import { useSensors } from "@/hooks/useSensors";

export default function HistoryPage() {
  const { history, loading, error } = useSensors(10000);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || history.length === 0) {
    return (
      <EmptyState
        title="No sensor data yet"
        message="Upload sensor readings first, then the full history will appear here."
      />
    );
  }

  const rows = history.map((reading) => [
    `${reading.id}`,
    <DateTimeCell key="time" iso={reading.created_at} />,
    `${reading.soil_moisture}`,
    `${reading.ph}`,
    `${reading.ec ?? 0}`,
    `${reading.nitrogen}`,
    `${reading.phosphorus}`,
    `${reading.potassium}`,
    `${reading.temperature}`,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sensor History"
        description={`${history.length} readings stored in the database`}
      />

      <DataTable
        headers={[
          "ID",
          "Time",
          "Moisture (%)",
          "pH",
          "EC",
          "N",
          "P",
          "K",
          "Temp (°C)",
        ]}
        mobileHeaders={["ID", "Time", "Moist %", "pH", "EC", "N", "P", "K", "Temp °C"]}
        rows={rows}
      />
    </div>
  );
}