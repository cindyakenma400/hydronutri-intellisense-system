"use client";

import { apiGet } from "@/lib/api";

import { Card } from "../ui";

export default function PrivacySection({
  clearStored,
  showToast,
}: {
  clearStored: () => void;
  showToast: (message: string) => void;
}) {
  async function testConnection() {
    try {
      await apiGet("/");
      showToast("Backend reachable.");
    } catch {
      showToast("Backend not reachable.");
    }
  }

  return (
    <Card
      title="Data & Privacy"
      subtitle="Manage what is stored and how it's used"
    >
      <dl className="space-y-3 text-sm mb-5">
        <div className="flex justify-between border-b pb-3">
          <dt className="text-gray-600">Sensor readings storage</dt>
          <dd className="text-gray-800">SQLite (local, on-device)</dd>
        </div>
        <div className="flex justify-between border-b pb-3">
          <dt className="text-gray-600">Leaf images</dt>
          <dd className="text-gray-800">Stored locally for disease review</dd>
        </div>
        <div className="flex justify-between pb-1">
          <dt className="text-gray-600">Data sharing</dt>
          <dd className="text-gray-800">Never shared with third parties</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={testConnection}
          className="border text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          Test backend connection
        </button>
        <button
          onClick={clearStored}
          className="text-sm font-medium text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition"
        >
          Clear local settings cache
        </button>
      </div>
    </Card>
  );
}
