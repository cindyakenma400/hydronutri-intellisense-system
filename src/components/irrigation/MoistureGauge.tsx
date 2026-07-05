interface MoistureGaugeProps {
  moisture?: number;
}

export default function MoistureGauge({
  moisture = 45,
}: MoistureGaugeProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Soil Moisture Level
      </h2>

      <div className="flex flex-col items-center">
        <div className="text-6xl font-bold text-blue-600">
          {moisture}%
        </div>

        <p className="mt-3 text-gray-500">
          Current moisture reading
        </p>
      </div>
    </div>
  );
}