// Matches the backend DashboardSummary schema
export interface DashboardSummary {
  soil_moisture: number;
  soil_ph: number;
  temperature: number;
  humidity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soil_quality: string;
  recommended_crop: string;
  irrigation_status: string;
  fertilizer_status: string;
  system_status: string;
}

// Matches the backend /controls/status response
export interface ControlState {
  pump_on: boolean;
  valve_on: boolean;
  auto_mode: boolean;
}