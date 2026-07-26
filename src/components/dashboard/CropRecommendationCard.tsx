import { CropScore } from "@/types/recommendation";

interface CropRecommendationProps {
  crops: CropScore[];
}

export default function CropRecommendation({
  crops,
}: CropRecommendationProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Crop Suitability
      </h2>

      <div className="space-y-4 mt-4">
        {crops.map((crop) => (
          <div key={crop.crop}>
            <div className="flex justify-between">
              <span>{crop.crop}</span>
              <span>{crop.score}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: `${crop.score}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}