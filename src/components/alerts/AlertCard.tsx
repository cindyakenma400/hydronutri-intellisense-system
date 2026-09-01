import { Droplets, FlaskConical, Leaf, Zap, Cpu, AlertTriangle, LucideIcon } from "lucide-react";

import { AlertItem } from "@/types/alert";

interface AlertCardProps {
  alert: AlertItem;
}

const iconConfig: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  "Irrigation Alert": { icon: Droplets, bg: "bg-blue-100", text: "text-blue-600" },
  "Soil pH Alert": { icon: FlaskConical, bg: "bg-purple-100", text: "text-purple-600" },
  "Nutrient Alert": { icon: Leaf, bg: "bg-amber-100", text: "text-amber-600" },
  "Salinity Alert": { icon: Zap, bg: "bg-orange-100", text: "text-orange-600" },
  "System Status": { icon: Cpu, bg: "bg-gray-100", text: "text-gray-600" },
};

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

export default function AlertCard({ alert }: AlertCardProps) {
  const { icon: Icon, bg, text } =
    iconConfig[alert.alert_type] ?? { icon: AlertTriangle, bg: "bg-red-100", text: "text-red-600" };

  const severityStyle = severityStyles[alert.severity] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white shadow-sm rounded-xl p-5 flex items-start gap-4 relative">
      <div
        className={`${bg} ${text} shrink-0 w-12 h-12 rounded-full flex items-center justify-center`}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0 pr-20">
        <h3 className="font-bold text-gray-900">{alert.alert_type}</h3>
        <p className="text-gray-500 mt-1">{alert.message}</p>
      </div>

      <span
        className={`${severityStyle} absolute top-5 right-5 text-xs font-medium px-2.5 py-1 rounded-full capitalize`}
      >
        {alert.severity}
      </span>
    </div>
  );
}
