"use client";

import { Card, Field, SaveBar, Toggle } from "../ui";
import { Settings } from "../settingsTypes";

type Props = {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  persist: (message?: string) => void;
};

export function IrrigationSection({ settings, update, persist }: Props) {
  return (
    <Card
      title="Automatic Irrigation"
      subtitle="Controls when the pump runs without you"
    >
      <Toggle
        label="Automatic irrigation"
        description="Runs the pump when moisture drops below the trigger"
        checked={settings.autoIrrigation}
        onChange={(v) => update("autoIrrigation", v)}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Moisture trigger (%)" type="number"
          value={String(settings.moistureTrigger)}
          onChange={(v) => update("moistureTrigger", Number(v))} />
        <Field label="Maximum pump runtime (minutes)" type="number"
          value={String(settings.maxPumpMinutes)}
          onChange={(v) => update("maxPumpMinutes", Number(v))} />
      </div>
      <SaveBar onSave={() => persist()} />
    </Card>
  );
}

export function FertilizationSection({ settings, update, persist }: Props) {
  return (
    <Card
      title="Automatic Fertilization"
      subtitle="Controls when the nutrient pump doses fertilizer"
    >
      <Toggle
        label="Automatic fertilization"
        description="Doses nutrients when NPK levels fall below the trigger"
        checked={settings.autoFertilization}
        onChange={(v) => update("autoFertilization", v)}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="NPK trigger (mg/kg)" type="number"
          value={String(settings.npkTrigger)}
          onChange={(v) => update("npkTrigger", Number(v))} />
        <Field label="Dosing duration (seconds)" type="number"
          value={String(settings.fertilizerDurationSeconds)}
          onChange={(v) => update("fertilizerDurationSeconds", Number(v))} />
      </div>
      <SaveBar onSave={() => persist()} />
    </Card>
  );
}

export function SoilQualitySection({ settings, update, persist }: Props) {
  return (
    <Card
      title="Soil Quality Assessment"
      subtitle="Controls how often soil health is scored"
    >
      <Toggle
        label="Soil quality assessment"
        description="Periodically scores soil health from sensor readings"
        checked={settings.soilQualityAssessment}
        onChange={(v) => update("soilQualityAssessment", v)}
      />
      <div className="mt-4 max-w-xs">
        <Field label="Assessment frequency (hours)" type="number"
          value={String(settings.assessmentFrequencyHours)}
          onChange={(v) => update("assessmentFrequencyHours", Number(v))} />
      </div>
      <SaveBar onSave={() => persist()} />
    </Card>
  );
}

export function DiseaseDetectionSection({ settings, update, persist }: Props) {
  return (
    <Card
      title="Disease Detection"
      subtitle="Controls automatic leaf scanning via the ESP32-CAM"
    >
      <Toggle
        label="Disease detection"
        description="Scans leaf images captured by the ESP32-CAM"
        checked={settings.diseaseDetection}
        onChange={(v) => update("diseaseDetection", v)}
      />
      <div className="mt-4 max-w-xs">
        <Field label="Confidence threshold (%)" type="number"
          value={String(settings.confidenceThreshold)}
          onChange={(v) => update("confidenceThreshold", Number(v))} />
      </div>
      <SaveBar onSave={() => persist()} />
    </Card>
  );
}
