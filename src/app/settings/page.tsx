"use client";

import { useCallback, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { apiGet, API_BASE_URL } from "@/lib/api";

const STORAGE_KEY = "hydronutri.settings";

type Thresholds = Record<string, { min: number; max: number }>;

type Settings = {
  farmName: string;
  location: string;
  farmerName: string;
  email: string;
  thresholds: Thresholds;
  autoIrrigation: boolean;
  moistureTrigger: number;
  maxPumpMinutes: number;
  notifyMoisture: boolean;
  notifyNutrients: boolean;
  notifyDisease: boolean;
  notifySystem: boolean;
  refreshSeconds: number;
};

const THRESHOLD_FIELDS = [
  { key: "soil_moisture", label: "Soil moisture", unit: "%" },
  { key: "ph", label: "pH", unit: "" },
  { key: "ec", label: "EC", unit: "dS/m" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "nitrogen", label: "Nitrogen (N)", unit: "mg/kg" },
  { key: "phosphorus", label: "Phosphorus (P)", unit: "mg/kg" },
  { key: "potassium", label: "Potassium (K)", unit: "mg/kg" },
];

const CROP_THRESHOLDS = [
  { crop: "Tomato", moisture: "60 – 80 %", ph: "6.0 – 6.8", n: "60 – 120", p: "40 – 80", k: "60 – 120", ec: "1.0 – 2.5" },
  { crop: "Onion", moisture: "50 – 70 %", ph: "6.0 – 7.0", n: "50 – 100", p: "35 – 70", k: "50 – 110", ec: "0.8 – 2.0" },
  { crop: "Maize", moisture: "45 – 70 %", ph: "5.8 – 7.0", n: "70 – 140", p: "30 – 70", k: "45 – 100", ec: "1.0 – 2.5" },
];

const DEFAULTS: Settings = {
  farmName: "",
  location: "",
  farmerName: "",
  email: "",
  thresholds: {
    soil_moisture: { min: 40, max: 80 },
    ph: { min: 5.5, max: 7.5 },
    ec: { min: 0.8, max: 2.5 },
    temperature: { min: 18, max: 32 },
    humidity: { min: 50, max: 85 },
    nitrogen: { min: 40, max: 120 },
    phosphorus: { min: 25, max: 80 },
    potassium: { min: 35, max: 120 },
  },
  autoIrrigation: true,
  moistureTrigger: 30,
  maxPumpMinutes: 15,
  notifyMoisture: true,
  notifyNutrients: true,
  notifyDisease: true,
  notifySystem: true,
  refreshSeconds: 5,
};

/* ------------------------------------------------------------- UI pieces */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border shadow-sm p-6">
      <header className="mb-5">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800
                   outline-none focus:border-green-600 focus:ring-2
                   focus:ring-green-600/20"
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${
          checked ? "bg-green-700" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                      transition-transform ${
                        checked ? "translate-x-5.5" : "translate-x-0.5"
                      }`}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- the page */

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      /* keep defaults */
    }
    return DEFAULTS;
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<
    { ok: boolean; ms?: number } | null
  >(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateThreshold(
    key: string,
    bound: "min" | "max",
    value: number
  ) {
    setSettings((current) => ({
      ...current,
      thresholds: {
        ...current.thresholds,
        [key]: { ...current.thresholds[key], [bound]: value },
      },
    }));
  }

  function save() {
    const problems = THRESHOLD_FIELDS.filter((field) => {
      const range = settings.thresholds[field.key];
      return range && range.min >= range.max;
    }).map((field) => `${field.label}: minimum must be below maximum.`);

    setErrors(problems);

    if (problems.length > 0) {
      showToast("Fix the highlighted ranges before saving.");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    showToast("Settings saved.");
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);

    const started = performance.now();

    try {
      await apiGet("/");
      setTestResult({ ok: true, ms: Math.round(performance.now() - started) });
    } catch {
      setTestResult({ ok: false });
    } finally {
      setTesting(false);
    }
  }

  async function exportCsv() {
    try {
      const rows = await apiGet<Record<string, unknown>[]>("/sensor/history");

      if (!Array.isArray(rows) || rows.length === 0) {
        showToast("No readings to export yet.");
        return;
      }

      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
        ),
      ].join("\n");

      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `hydronutri-readings-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      showToast(`Exported ${rows.length} readings.`);
    } catch {
      showToast("Export failed. Is the backend running?");
    }
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Settings"
        description="System configuration and farm profile"
      />

      <Card
        title="Farm profile"
        subtitle="Identifies this installation across reports and alerts"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Farm name" value={settings.farmName}
            placeholder="Akenma Family Farm"
            onChange={(v) => update("farmName", v)} />
          <Field label="Location" value={settings.location}
            placeholder="Accra, Ghana"
            onChange={(v) => update("location", v)} />
          <Field label="Farmer name" value={settings.farmerName}
            placeholder="Full name"
            onChange={(v) => update("farmerName", v)} />
          <Field label="Email" type="email" value={settings.email}
            placeholder="name@example.com"
            onChange={(v) => update("email", v)} />
        </div>
      </Card>

      <Card
        title="Sensor thresholds"
        subtitle="Readings outside these ranges raise an alert"
      >
        {errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            {errors.map((error) => (
              <p key={error} className="text-sm text-red-700">{error}</p>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 font-medium">Parameter</th>
                <th className="pb-2 font-medium">Minimum</th>
                <th className="pb-2 font-medium">Maximum</th>
              </tr>
            </thead>
            <tbody>
              {THRESHOLD_FIELDS.map((field) => {
                const range = settings.thresholds[field.key];
                const invalid = range && range.min >= range.max;

                return (
                  <tr key={field.key} className="border-b last:border-0">
                    <td className="py-2.5 text-gray-700">
                      {field.label}
                      {field.unit && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({field.unit})
                        </span>
                      )}
                    </td>
                    {(["min", "max"] as const).map((bound) => (
                      <td key={bound} className="py-2.5 pr-3">
                        <input
                          type="number"
                          step="0.1"
                          value={range?.[bound] ?? 0}
                          onChange={(e) =>
                            updateThreshold(field.key, bound, Number(e.target.value))
                          }
                          className={`w-24 border rounded-lg px-2 py-1.5 text-sm outline-none
                            focus:ring-2 focus:ring-green-600/20 ${
                              invalid ? "border-red-400" : "focus:border-green-600"
                            }`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="Irrigation"
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
      </Card>

      <Card
        title="Notifications"
        subtitle="Choose which conditions raise an alert"
      >
        <div className="divide-y">
          <Toggle label="Moisture and irrigation"
            checked={settings.notifyMoisture}
            onChange={(v) => update("notifyMoisture", v)} />
          <Toggle label="Nutrient levels"
            checked={settings.notifyNutrients}
            onChange={(v) => update("notifyNutrients", v)} />
          <Toggle label="Disease detection results"
            checked={settings.notifyDisease}
            onChange={(v) => update("notifyDisease", v)} />
          <Toggle label="System and connection status"
            checked={settings.notifySystem}
            onChange={(v) => update("notifySystem", v)} />
        </div>
      </Card>

      <Card
        title="System"
        subtitle="Connection, refresh rate, and stored data"
      >
        <dl className="space-y-3 text-sm mb-5">
          <div className="flex justify-between border-b pb-3">
            <dt className="text-gray-600">Backend API</dt>
            <dd className="font-mono text-xs text-gray-800">{API_BASE_URL}</dd>
          </div>
          <div className="flex justify-between border-b pb-3">
            <dt className="text-gray-600">Database</dt>
            <dd className="font-mono text-xs text-gray-800">
              SQLite (backend/hydronutri.db)
            </dd>
          </div>
        </dl>

        <div className="max-w-xs mb-5">
          <Field label="Dashboard refresh rate (seconds)" type="number"
            value={String(settings.refreshSeconds)}
            onChange={(v) => update("refreshSeconds", Number(v))} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={testConnection}
            className="bg-gray-800 text-white text-sm font-medium px-4 py-2
                       rounded-lg hover:bg-gray-700 transition"
          >
            {testing ? "Testing..." : "Test connection"}
          </button>

          <button
            onClick={exportCsv}
            className="border text-sm font-medium text-gray-700 px-4 py-2
                       rounded-lg hover:bg-gray-50 transition"
          >
            Export readings as CSV
          </button>

          {testResult?.ok && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              Connected in {testResult.ms}ms
            </span>
          )}
          {testResult && !testResult.ok && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Not reachable. Is uvicorn running?
            </span>
          )}
        </div>
      </Card>

      <Card
        title="Crop threshold reference"
        subtitle="Optimal ranges used by the recommendation engine (N, P, K in mg/kg; EC in dS/m)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 font-medium">Crop</th>
                <th className="pb-2 font-medium">Moisture</th>
                <th className="pb-2 font-medium">pH</th>
                <th className="pb-2 font-medium">N</th>
                <th className="pb-2 font-medium">P</th>
                <th className="pb-2 font-medium">K</th>
                <th className="pb-2 font-medium">EC</th>
              </tr>
            </thead>
            <tbody>
              {CROP_THRESHOLDS.map((row) => (
                <tr key={row.crop} className="border-b last:border-0 text-gray-700">
                  <td className="py-2.5 font-medium text-gray-800">{row.crop}</td>
                  <td className="py-2.5">{row.moisture}</td>
                  <td className="py-2.5">{row.ph}</td>
                  <td className="py-2.5">{row.n}</td>
                  <td className="py-2.5">{row.p}</td>
                  <td className="py-2.5">{row.k}</td>
                  <td className="py-2.5">{row.ec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="About" subtitle="Project and team information">
        <dl className="space-y-3 text-sm">
          {[
            ["System", "HydroNutri IntelliSense"],
            ["Version", "1.0.0"],
            ["Institution", "SATES"],
            ["Supervisor", "Mr. Nicholas Owusu-Debrah"],
            ["Team", "Comfort Enyonam Quarcoo, Beatrice Boabeng, Cindy Ayirebono Akenma"],
          ].map(([term, detail]) => (
            <div key={term} className="flex justify-between gap-6 border-b pb-3 last:border-0">
              <dt className="shrink-0 text-gray-600">{term}</dt>
              <dd className="text-right text-gray-800">{detail}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex justify-end pb-4">
        <button
          onClick={save}
          className="bg-green-700 text-white text-sm font-semibold px-6 py-2.5
                     rounded-lg hover:bg-green-800 transition"
        >
          Save changes
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm
                        font-medium px-4 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}