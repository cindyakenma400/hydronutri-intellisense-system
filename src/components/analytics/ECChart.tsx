"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { SensorReading } from "@/types/sensor";

interface ChartProps {
  history: SensorReading[];
}

export default function ECChart({
  history,
}: ChartProps) {
  const data = [...history]
    .reverse()
    .slice(-30)
    .map((reading) => ({
      time: new Date(reading.created_at).toLocaleTimeString(),
      ec: reading.ec ?? 0,
    }));

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Electrical Conductivity (EC)
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ec"
              stroke="#9333ea"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Indicates nutrient concentration and soil fertility.
      </p>
    </div>
  );
}