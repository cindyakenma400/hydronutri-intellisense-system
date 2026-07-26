"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { SensorReading } from "@/types/sensor";

interface SensorOverviewProps {
  history: SensorReading[];
}

function MiniChart({
  title,
  data,
  dataKey,
  color,
}: {
  title: string;
  data: Record<string, number | string>[];
  dataKey: string;
  color: string;
}) {
  return (
    <div className="h-40 bg-gray-50 rounded-lg p-2">
      <p className="text-sm text-gray-500 mb-1">{title}</p>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SensorOverview({
  history,
}: SensorOverviewProps) {
  // history arrives newest-first; charts need oldest-first
  const data = [...history]
    .reverse()
    .slice(-20)
    .map((reading) => ({
      time: new Date(reading.created_at).toLocaleTimeString(),
      moisture: reading.soil_moisture,
      ph: reading.ph,
      ec: reading.ec ?? 0,
      nitrogen: reading.nitrogen,
    }));

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg mb-4">
        Real-Time Sensor Readings
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <MiniChart
          title="Moisture (%)"
          data={data}
          dataKey="moisture"
          color="#2563eb"
        />

        <MiniChart
          title="pH"
          data={data}
          dataKey="ph"
          color="#16a34a"
        />

        <MiniChart
          title="Nitrogen (mg/kg)"
          data={data}
          dataKey="nitrogen"
          color="#ca8a04"
        />

        <MiniChart
          title="EC (dS/m)"
          data={data}
          dataKey="ec"
          color="#9333ea"
        />
      </div>
    </div>
  );
}