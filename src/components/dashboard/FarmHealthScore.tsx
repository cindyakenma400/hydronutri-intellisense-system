
export default function FarmHealthScore() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Farm Health Score
      </h2>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className="bg-green-600 h-6 rounded-full"
            style={{ width: "88%" }}
          />
        </div>

        <p className="mt-3 text-green-700 font-bold text-lg">
          88%
        </p>
      </div>
    </div>
  );
}