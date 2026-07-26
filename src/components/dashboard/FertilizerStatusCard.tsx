import { nutrientStatus } from "@/utils/calculateStatus";

interface FertilizationStatusCardProps {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export default function FertilizationStatusCard({
  nitrogen = 0,
  phosphorus = 0,
  potassium = 0,
}: FertilizationStatusCardProps) {
  const n = nutrientStatus(nitrogen, 50, 60);
  const p = nutrientStatus(phosphorus, 40, 50);
  const k = nutrientStatus(potassium, 50, 60);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Fertilization Status
      </h2>

      <div className="space-y-3 mt-4">
        <div className="flex justify-between">
          <span>Nitrogen ({nitrogen})</span>
          <span className={n.color}>{n.label}</span>
        </div>

        <div className="flex justify-between">
          <span>Phosphorus ({phosphorus})</span>
          <span className={p.color}>{p.label}</span>
        </div>

        <div className="flex justify-between">
          <span>Potassium ({potassium})</span>
          <span className={k.color}>{k.label}</span>
        </div>
      </div>
    </div>
  );
}