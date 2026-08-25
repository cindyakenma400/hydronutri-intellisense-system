"use client";

import { useState } from "react";
import { Check, Droplets, FlaskConical, Leaf, Pencil, Sprout, X } from "lucide-react";

import { Card, Field, PreferenceCard, Select } from "../ui";
import { CropType, Settings } from "../settingsTypes";

export default function GeneralSection({
  settings,
  update,
  persist,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  persist: (message?: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <Card
        title="Farm Information"
        subtitle="Identifies this installation across reports and alerts"
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  persist();
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded-lg transition"
              >
                <Check size={15} /> Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                <X size={15} /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <Pencil size={15} /> Edit
            </button>
          )
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Farm Name" value={settings.farmName}
            disabled={!editing}
            placeholder="Akenma Family Farm"
            onChange={(v) => update("farmName", v)} />
          <Field label="Farmer Name" value={settings.farmerName}
            disabled={!editing}
            placeholder="Full name"
            onChange={(v) => update("farmerName", v)} />
          <Field label="Location" value={settings.location}
            disabled={!editing}
            placeholder="Accra, Ghana"
            onChange={(v) => update("location", v)} />
          <Select label="Crop Type" value={settings.cropType}
            disabled={!editing}
            options={["Maize", "Tomato", "Onion"]}
            onChange={(v) => update("cropType", v as CropType)} />
          <Field label="Farm Size (acres)" value={settings.farmSize}
            disabled={!editing}
            placeholder="2.5"
            onChange={(v) => update("farmSize", v)} />
        </div>
      </Card>

      <Card
        title="System Preferences"
        subtitle="Enable or disable the platform's automated systems"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PreferenceCard
            icon={Droplets}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
            title="Automatic Irrigation"
            description="Runs the pump when soil moisture drops below the trigger."
            checked={settings.autoIrrigation}
            onChange={(v) => {
              update("autoIrrigation", v);
              persist();
            }}
          />
          <PreferenceCard
            icon={Sprout}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-50"
            title="Automatic Fertilization"
            description="Doses nutrients when NPK levels fall below target."
            checked={settings.autoFertilization}
            onChange={(v) => {
              update("autoFertilization", v);
              persist();
            }}
          />
          <PreferenceCard
            icon={FlaskConical}
            iconColor="text-purple-500"
            iconBg="bg-purple-50"
            title="Soil Quality Assessment"
            description="Periodically scores soil health from sensor readings."
            checked={settings.soilQualityAssessment}
            onChange={(v) => {
              update("soilQualityAssessment", v);
              persist();
            }}
          />
          <PreferenceCard
            icon={Leaf}
            iconColor="text-green-600"
            iconBg="bg-green-50"
            title="Disease Detection"
            description="Scans leaf images captured by the ESP32-CAM."
            checked={settings.diseaseDetection}
            onChange={(v) => {
              update("diseaseDetection", v);
              persist();
            }}
          />
        </div>
      </Card>
    </>
  );
}
