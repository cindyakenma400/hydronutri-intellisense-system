export interface SensorData {
  moisture: number;
  ph: number;
  temperature?: number;
  ec?: number;
  timestamp: string;
}

export interface PumpStatus {
  isOn: boolean;
  mode: "AUTO" | "MANUAL";
}