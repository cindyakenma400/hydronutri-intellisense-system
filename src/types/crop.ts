export interface SoilAssessment {
  soil_quality: string;
  soil_score: number;
  soil_moisture: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  recommendation: string;
}

export interface FertilizationResult {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  recommendations: string[];
}

export interface FertilizationHistoryItem {
  id: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  recommendation: string;
  created_at: string;
}