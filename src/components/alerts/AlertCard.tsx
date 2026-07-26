import { AlertItem } from "@/types/alert";

interface AlertCardProps {
  alert: AlertItem;
}

const styles: Record<string, string> = {
  "Irrigation Alert": "bg-red-100 border-red-500",
  "Soil pH Alert": "bg-yellow-100 border-yellow-500",
  "Nutrient Alert": "bg-yellow-100 border-yellow-500",
  "Salinity Alert": "bg-red-100 border-red-500",
  "System Status": "bg-blue-100 border-blue-500",
};

export default function AlertCard({
  alert,
}: AlertCardProps) {
  const style =
    styles[alert.type] ?? "bg-gray-100 border-gray-500";

  const icon = alert.type === "System Status" ? "ℹ" : "⚠";

  return (
    <div className={`${style} border-l-4 p-4 rounded`}>
      <span className="font-medium">
        {icon} {alert.type}:
      </span>{" "}
      {alert.message}
    </div>
  );
}