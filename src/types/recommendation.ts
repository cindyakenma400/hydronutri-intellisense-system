// Matches the backend crop recommendation schemas
export interface CropScore {
  crop: string;
  score: number;
  suitability: string;
  limiting_factors: string[];
  suggestions: string[];
}

export interface CropRecommendation {
  recommended_crop: string;
  confidence: number;
  message: string;
  soil_moisture: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ec: number;
  ranking: CropScore[];
}

export interface RecommendationHistoryItem {
  id: number;
  recommended_crop: string;
  confidence: number;
  created_at: string;
}