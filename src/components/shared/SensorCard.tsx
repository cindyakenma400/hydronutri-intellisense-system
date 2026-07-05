interface SensorCardProps {
  title: string;
  value: string;
  unit?: string;
}

export default function SensorCard({
  title,
  value,
  unit,
}: SensorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-gray-500 text-sm">{title}</h3>

      <div className="mt-2 text-3xl font-bold">
        {value}
        {unit && (
          <span className="text-lg ml-1 text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}