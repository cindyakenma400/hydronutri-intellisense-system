interface FarmHealthScoreProps {
  score?: number;
}

export default function FarmHealthScore({
  score = 0,
}: FarmHealthScoreProps) {
  const color =
    score >= 60
      ? "bg-green-600"
      : score >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  const textColor =
    score >= 60
      ? "text-green-700"
      : score >= 40
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Farm Health Score
      </h2>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className={`${color} h-6 rounded-full transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className={`mt-3 ${textColor} font-bold text-lg`}>
          {score}%
        </p>
      </div>
    </div>
  );
}