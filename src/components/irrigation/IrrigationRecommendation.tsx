import { IrrigationStatus } from "@/types/sensor";

interface IrrigationRecommendationProps {
  status: IrrigationStatus | null;
}

export default function IrrigationRecommendation({
  status,
}: IrrigationRecommendationProps) {
  if (!status) return null;

  const needsWater = status.irrigation_needed;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Irrigation Recommendation
      </h2>

      <div className="space-y-4">
        <div
          className={`p-3 rounded-lg border ${
            needsWater
              ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p className="font-medium">{status.message}</p>

          <p className="text-sm text-gray-600 mt-1">
            {needsWater
              ? "Soil moisture is below the optimal range for healthy crop growth."
              : "Soil moisture is within the optimal range. No action needed."}
          </p>
        </div>

        {needsWater && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="font-medium">
              Recommended Action
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Apply approximately {status.water_amount_liters} liters
              of water per plot.
            </p>
          </div>
        )}

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="font-medium">
            Expected Outcome
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Soil moisture will stay in the optimal range for maize,
            tomato, and onion cultivation.
          </p>
        </div>
      </div>
    </div>
  );
}