
interface KPICardProps {
  title: string;
  value: string;
  status: string;
}

export default function KPICard({
  title,
  value,
  status,
}: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-gray-500">{title}</h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

      <p className="text-green-600 text-sm mt-2">
        {status}
      </p>
    </div>
  );
}