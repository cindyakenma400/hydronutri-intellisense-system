import { SensorData } from "@/types/sensor";

export function getSensorData(): SensorData {
  return {
    moisture: Math.floor(Math.random() * 100),
    ph: parseFloat((Math.random() * 3 + 4).toFixed(1)),
    temperature: Math.floor(Math.random() * 15 + 20),
    ec: parseFloat((Math.random() * 2).toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}