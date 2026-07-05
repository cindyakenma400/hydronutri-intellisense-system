import { SensorData, PumpStatus } from "./sensor";
import { CropRecommendation } from "./crop";

export interface DashboardData {
  sensors: SensorData;
  pump: PumpStatus;
  recommendations: CropRecommendation[];
}