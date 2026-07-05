export default function FertilizerRecommendation() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Fertilizer Recommendation
      </h2>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="font-medium">
            Potassium Deficiency Detected
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Current potassium level is below the recommended threshold.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="font-medium">
            Recommended Action
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Apply NPK fertilizer with a higher potassium ratio within the next irrigation cycle.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Expected Outcome
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Improved crop growth and nutrient balance for maize, tomato, and onion crops.
          </p>
        </div>
      </div>
    </div>
  );
}