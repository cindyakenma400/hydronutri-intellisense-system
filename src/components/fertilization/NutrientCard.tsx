interface NutrientCardProps {
  nutrient: string;
  value: string;
  status: string;
}

export default function NutrientCard({
  nutrient,
  value,
  status,
}: NutrientCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-gray-500 font-medium">
        {nutrient}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

      <p className="text-sm mt-2 text-green-600">
        {status}
      </p>
    </div>
  );
}