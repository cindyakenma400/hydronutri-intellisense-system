export default function DiseaseTrendChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Disease Occurrence Trend
      </h2>

      <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
        <p className="text-gray-500">
          Disease Trend Chart
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Displays disease cases detected across the farm over time.
      </p>
    </div>
  );
}