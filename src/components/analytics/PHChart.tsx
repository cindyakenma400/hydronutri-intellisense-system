export default function PHChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Soil pH Trend
      </h2>

      <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
        <p className="text-gray-500">
          pH Trend Chart
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Monitors acidity and alkalinity levels of the soil.
      </p>
    </div>
  );
}