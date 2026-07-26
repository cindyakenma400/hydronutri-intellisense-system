interface FertilizerRecommendationProps {
  recommendations: string[];
}

export default function FertilizerRecommendation({
  recommendations,
}: FertilizerRecommendationProps) {
  const allGood =
    recommendations.length === 1 &&
    recommendations[0].includes("acceptable range");

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Fertilizer Recommendation
      </h2>

      <div className="space-y-3">
        {recommendations.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              allGood
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <p className="font-medium">{item}</p>
          </div>
        ))}

        {!allGood && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="font-medium">
              Expected Outcome
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Improved crop growth and nutrient balance for maize,
              tomato, and onion crops.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}