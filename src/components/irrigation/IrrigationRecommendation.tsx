export default function IrrigationRecommendation() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Irrigation Recommendation
      </h2>

      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="font-medium">
            Moisture Below Optimal Threshold
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Soil moisture is approaching the lower limit required for healthy crop growth.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="font-medium">
            Recommended Action
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Activate irrigation system for approximately 15 minutes.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Expected Outcome
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Soil moisture will return to the optimal range for maize, tomato, and onion cultivation.
          </p>
        </div>
      </div>
    </div>
  );
}