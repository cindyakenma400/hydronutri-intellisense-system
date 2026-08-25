"use client";

import { Card, SaveBar, Toggle } from "../ui";
import { Settings } from "../settingsTypes";

export default function NotificationsSection({
  settings,
  update,
  persist,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  persist: (message?: string) => void;
}) {
  return (
    <Card
      title="Notifications"
      subtitle="Choose which conditions raise an alert, and where"
    >
      <div className="divide-y mb-2">
        <Toggle label="In-App Notifications"
          description="Show alerts in the notification bell"
          checked={settings.notifyInApp}
          onChange={(v) => update("notifyInApp", v)} />
        <Toggle label="Email Notifications"
          description="Send alert summaries to your email"
          checked={settings.notifyEmail}
          onChange={(v) => update("notifyEmail", v)} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-5 mb-1">
        Alert types
      </p>
      <div className="divide-y">
        <Toggle label="Soil Moisture Alerts"
          checked={settings.notifySoilMoisture}
          onChange={(v) => update("notifySoilMoisture", v)} />
        <Toggle label="Irrigation Alerts"
          checked={settings.notifyIrrigation}
          onChange={(v) => update("notifyIrrigation", v)} />
        <Toggle label="Fertilization Alerts"
          checked={settings.notifyFertilization}
          onChange={(v) => update("notifyFertilization", v)} />
        <Toggle label="Soil Quality Alerts"
          checked={settings.notifySoilQuality}
          onChange={(v) => update("notifySoilQuality", v)} />
        <Toggle label="Disease Detection Alerts"
          checked={settings.notifyDisease}
          onChange={(v) => update("notifyDisease", v)} />
        <Toggle label="System Alerts"
          checked={settings.notifySystem}
          onChange={(v) => update("notifySystem", v)} />
      </div>

      <SaveBar onSave={() => persist()} />
    </Card>
  );
}
