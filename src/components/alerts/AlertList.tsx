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
      {alerts.map((alert, index) => (
        <AlertCard
          key={index}
          alert={alert}
        />
      ))}
    </div>
  );
}