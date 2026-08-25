import { Droplets, FlaskConical, Leaf, Sprout, Zap } from "lucide-react";

interface SoilSummaryCardProps {
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export default function SoilSummaryCard({
  moisture,
  ph,
  nitrogen,
  phosphorus,
  potassium,
}: SoilSummaryCardProps) {
  const metrics = [
    {
      label: "Moisture",
      value: `${moisture}%`,
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "pH",
      value: ph,
      icon: FlaskConical,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Nitrogen",
      value: nitrogen,
      icon: Leaf,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Phosphorus",
      value: phosphorus,
      icon: Sprout,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Potassium",
      value: potassium,
      icon: Zap,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Soil Summary
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
