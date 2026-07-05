
export default function PumpStatusCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Irrigation Pump
      </h2>

      <div className="mt-4">
        <p className="text-3xl font-bold text-green-600">
          ON
        </p>

        <p className="mt-2 text-gray-500">
          Auto Mode Enabled
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Last Activated: 10:24 AM
        </p>
      </div>
    </div>
  );
}