// Matches the backend SensorResponse schema
export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  ec: number | null;
  created_at: string;
}

export interface IrrigationStatus {
  irrigation_needed: boolean;
  water_amount_liters: number;
  message: string;
}

export interface IrrigationHistoryItem extends IrrigationStatus {
  id: number;
  created_at: string;
}