export default function NPKChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        NPK Nutrient Analysis
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>Nitrogen (N)</span>
            <span>45 ppm</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: "75%" }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Phosphorus (P)</span>
            <span>60 ppm</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: "90%" }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Potassium (K)</span>
            <span>25 ppm</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full"
              style={{ width: "40%" }}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Current nutrient distribution across the monitored field.
      </p>
    </div>
  );
}