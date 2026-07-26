interface NPKChartProps {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const width = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value} mg/kg</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function NPKChart({
  nitrogen = 0,
  phosphorus = 0,
  potassium = 0,
}: NPKChartProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        NPK Nutrient Analysis
      </h2>

      <div className="space-y-4">
        <Bar
          label="Nitrogen (N)"
          value={nitrogen}
          max={150}
          color="bg-green-500"
        />

        <Bar
          label="Phosphorus (P)"
          value={phosphorus}
          max={100}
          color="bg-blue-500"
        />

        <Bar
          label="Potassium (K)"
          value={potassium}
          max={150}
          color="bg-yellow-500"
        />
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Live nutrient readings from the field sensors.
      </p>
    </div>
  );
}