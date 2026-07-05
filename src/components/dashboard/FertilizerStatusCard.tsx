
export default function FertilizationStatusCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Fertilization Status
      </h2>

      <div className="space-y-3 mt-4">
        <div className="flex justify-between">
          <span>Nitrogen</span>
          <span className="text-yellow-600">
            Medium
          </span>
        </div>

        <div className="flex justify-between">
          <span>Phosphorus</span>
          <span className="text-green-600">
            Good
          </span>
        </div>

        <div className="flex justify-between">
          <span>Potassium</span>
          <span className="text-red-600">
            Low
          </span>
        </div>
      </div>
    </div>
  );
}