"use client";

import { Card, Field, SaveBar, Toggle } from "../ui";
import { CropType, Settings } from "../settingsTypes";

const CROP_OPTIONS: CropType[] = ["None", "Tomato", "Onion", "Maize"];

const CROP_NPK_RANGES: Record<string, { n: string; p: string; k: string }> = {
  Tomato: { n: "60 – 120", p: "40 – 80", k: "60 – 120" },
  Onion:  { n: "50 – 100", p: "35 – 70", k: "50 – 110" },
  Maize:  { n: "70 – 140", p: "30 – 70", k: "45 – 100" },
};

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
        description="Runs the pump when moisture drops below the trigger and stops when it reaches the stop point"
        checked={settings.autoIrrigation}
        onChange={(v) => update("autoIrrigation", v)}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Pump ON below (%)" type="number"
          value={String(settings.moistureTrigger)}
          onChange={(v) => update("moistureTrigger", Number(v))} />
        <Field label="Pump OFF at (%)" type="number"
          value={String(settings.moistureStop)}
          onChange={(v) => update("moistureStop", Number(v))} />
        <Field label="Max runtime (minutes)" type="number"
          value={String(settings.maxPumpMinutes)}
          onChange={(v) => update("maxPumpMinutes", Number(v))} />
      </div>
      <SaveBar onSave={() => persist()} />
    </Card>
  );
}

export function FertilizationSection({ settings, update, persist }: Props) {
  const crop = settings.currentCrop || "None";
  const ranges = CROP_NPK_RANGES[crop];

  return (
    <Card
      title="Automatic Fertilization"
      subtitle="Controls when the nutrient pump doses fertilizer based on crop-specific thresholds"
    >
      <Toggle
        label="Automatic fertilization"
        description="Doses nutrients when NPK levels fall below the optimal range for the selected crop"
        checked={settings.autoFertilization}
        onChange={(v) => update("autoFertilization", v)}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current crop
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            value={crop}
            onChange={(e) => update("currentCrop", e.target.value as CropType)}
          >
            {CROP_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c === "None" ? "None (select after assessment)" : c}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Set this after running a soil suitability assessment
          </p>
        </div>
        <Field label="Dosing duration (seconds)" type="number"
          value={String(settings.fertilizerDurationSeconds)}
          onChange={(v) => update("fertilizerDurationSeconds", Number(v))} />
      </div>

      {crop !== "None" && ranges ? (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            NPK thresholds for {crop} (mg/kg)
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
            <div><span className="font-medium">N:</span> {ranges.n}</div>
            <div><span className="font-medium">P:</span> {ranges.p}</div>
            <div><span className="font-medium">K:</span> {ranges.k}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            The valve opens when any nutrient falls below the lower value
            and closes when all reach the upper value.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-700">
            Select a crop to enable automatic fertilization thresholds.
            Run a soil suitability assessment first to determine the best crop.
          </p>
        </div>
      )}

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
