import { CropScore } from "@/types/recommendation";

interface CropRankingCardProps {
  crops: CropScore[];
}

export default function CropRankingCard({
  crops,
}: CropRankingCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Crop Ranking
      </h2>

      <div className="space-y-4">
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