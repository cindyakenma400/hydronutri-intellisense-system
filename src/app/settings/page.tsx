"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { apiGet, API_BASE_URL } from "@/lib/api";

const thresholds = [
  { crop: "Tomato", moisture: "60 – 80 %", ph: "6.0 – 6.8", n: "60 – 120", p: "40 – 80", k: "60 – 120", ec: "1.0 – 2.5" },
  { crop: "Onion", moisture: "50 – 70 %", ph: "6.0 – 7.0", n: "50 – 100", p: "35 – 70", k: "50 – 110", ec: "0.8 – 2.0" },
  { crop: "Maize", moisture: "45 – 70 %", ph: "5.8 – 7.0", n: "70 – 140", p: "30 – 70", k: "45 – 100", ec: "1.0 – 2.5" },
];

export default function SettingsPage() {
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load saved values when the page opens
  useEffect(() => {
    setFarmName(localStorage.getItem("farmName") ?? "");
    setLocation(localStorage.getItem("farmLocation") ?? "");
  }, []);

  function saveProfile() {
    localStorage.setItem("farmName", farmName);
    localStorage.setItem("farmLocation", location);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);

    try {
      await apiGet("/");
      setTestResult("Connected: the backend is reachable and running.");
    } catch {
      setTestResult(
        "Not reachable: make sure the backend terminal is running uvicorn."
      );
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="System configuration and farm profile"
      />

      {/* Farm profile */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">
          Farm Profile
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Farm Name
            </label>
            <input
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Akenma Family Farm"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Accra, Ghana"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={saveProfile}
            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Save Profile
          </button>

          {saved && (
            <span className="text-sm text-green-700">
              Saved! The navbar avatar updates on the next page refresh.
            </span>
          )}
        </div>
      </div>

      {/* System configuration */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">
          System Configuration
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Backend API URL</span>
            <span className="font-mono text-gray-800">
              {API_BASE_URL}
            </span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Dashboard refresh rate</span>
            <span className="text-gray-800">Every 5 seconds</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Database</span>
            <span className="text-gray-800">SQLite (backend/hydronutri.db)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={testConnection}
            disabled={testing}
            className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Backend Connection"}
          </button>

          {testResult && (
            <span
              className={`text-sm ${
                testResult.startsWith("Connected")
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {testResult}
            </span>
          )}
        </div>
      </div>

      {/* Crop thresholds reference */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-1">
          Crop Threshold Reference
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Optimal ranges used by the recommendation engine
          (N, P, K in mg/kg; EC in dS/m).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Crop</th>
                <th className="text-left p-3">Moisture</th>
                <th className="text-left p-3">pH</th>
                <th className="text-left p-3">N</th>
                <th className="text-left p-3">P</th>
                <th className="text-left p-3">K</th>
                <th className="text-left p-3">EC</th>
              </tr>
            </thead>

            <tbody>
              {thresholds.map((row) => (
                <tr key={row.crop} className="border-b">
                  <td className="p-3 font-medium">{row.crop}</td>
                  <td className="p-3">{row.moisture}</td>
                  <td className="p-3">{row.ph}</td>
                  <td className="p-3">{row.n}</td>
                  <td className="p-3">{row.p}</td>
                  <td className="p-3">{row.k}</td>
                  <td className="p-3">{row.ec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">
          About This Project
        </h2>

        <p className="text-sm text-gray-600">
          HydroNutri-IntelliSense System — An IoT-Enabled Framework for
          Intelligent Water-Nutrient Management and Crop Health
          Diagnostics.
        </p>

        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Project Team</p>
            <p className="text-gray-800">Comfort Enyonam Quarcoo</p>
            <p className="text-gray-800">Beatrice Boabeng</p>
            <p className="text-gray-800">Cindy Ayirebono Akenma</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1">Supervisor</p>
            <p className="text-gray-800">Mr. Nicholas Owusu-Debrah</p>
            <p className="text-gray-500 mt-3 mb-1">Version</p>
            <p className="text-gray-800">1.0.0 — 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}