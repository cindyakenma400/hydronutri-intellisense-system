"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import AlertList from "@/components/alerts/AlertList";

import { AlertResponse } from "@/types/alert";
import { getAlerts } from "@/services/alertService";

export default function AlertsPage() {
  const [data, setData] = useState<AlertResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await getAlerts();

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
        message="Upload sensor readings first, then farm alerts will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Notifications"
        description={`${data.total_alerts} active alert(s) based on the latest sensor reading`}
      />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {data.total_alerts} alert{data.total_alerts === 1 ? "" : "s"} found
          </span>
        </div>

        <AlertList alerts={data.alerts} />
      </div>
    </div>
  );
}