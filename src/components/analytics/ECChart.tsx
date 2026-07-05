export default function ECChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Electrical Conductivity (EC)
      </h2>

      <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
        <p className="text-gray-500">
          EC Trend Chart
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Indicates nutrient concentration and soil fertility.
      </p>
    </div>
  );
}