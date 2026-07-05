interface SoilSummaryCardProps {
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export default function SoilSummaryCard({
  moisture,
  ph,
  nitrogen,
  phosphorus,
  potassium,
}: SoilSummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Soil Summary
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>💧 Moisture: {moisture}%</div>
        <div>⚗️ pH: {ph}</div>
        <div>🟢 Nitrogen: {nitrogen}</div>
        <div>🟡 Phosphorus: {phosphorus}</div>
        <div>🟠 Potassium: {potassium}</div>
      </div>
    </div>
  );
}