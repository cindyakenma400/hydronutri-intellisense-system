import { AlertItem } from "@/types/alert";
import AlertCard from "./AlertCard";

interface AlertListProps {
  alerts: AlertItem[];
}

export default function AlertList({
  alerts,
}: AlertListProps) {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
        />
      ))}
    </div>
  );
}