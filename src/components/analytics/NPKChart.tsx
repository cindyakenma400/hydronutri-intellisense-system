"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { SensorReading } from "@/types/sensor";

interface ChartProps {
  history: SensorReading[];
}

export default function NPKChart({
  history,
}: ChartProps) {
  const data = [...history]
    .reverse()
    .slice(-30)
    .map((reading) => ({
      time: new Date(reading.created_at).toLocaleTimeString(),
      N: reading.nitrogen,
      P: reading.phosphorus,
      K: reading.potassium,
    }));

  const latest = history[0];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        NPK Nutrient Levels
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="N" stroke="#16a34a" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="P" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="K" stroke="#ca8a04" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {latest && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="font-semibold">N</h3>
            <p>{latest.nitrogen} mg/kg</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-semibold">P</h3>
            <p>{latest.phosphorus} mg/kg</p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <h3 className="font-semibold">K</h3>
            <p>{latest.potassium} mg/kg</p>
          </div>
        </div>
      )}
    </div>
  );
}