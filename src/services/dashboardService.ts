import { getSensorData } from "./sensorService";
import { getBestCrop } from "@/utils/cropHelpers";

export function getDashboardData() {
  const sensors = getSensorData();

  const crop = getBestCrop(sensors.moisture, sensors.ph);

  const pump = {
    isOn: sensors.moisture < 30,
    mode: "AUTO" as const,
  };

  return {
    sensors,
    pump,
    recommendations: [crop],
  };
}