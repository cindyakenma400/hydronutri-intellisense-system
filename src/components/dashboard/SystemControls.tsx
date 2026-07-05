export default function SystemControl() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        System Controls
      </h2>

      <div className="space-y-4 mt-4">
        <button className="w-full bg-green-600 text-white py-2 rounded-lg">
          Irrigation Pump ON
        </button>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Fertilizer Valve ON
        </button>

        <button className="w-full bg-gray-800 text-white py-2 rounded-lg">
          Auto Mode Enabled
        </button>
      </div>
    </div>
  );
}