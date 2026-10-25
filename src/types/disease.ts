// Matches the backend DiseasePredictionResponse schema
export interface DiseaseResult {
  crop: string;
  disease_detected: string;
  confidence: number;
  severity: string;
  treatment: string[];
  status: string;
  image_source: string;
  recommended_action: string;
}

export interface DiseaseHistoryItem {
  id: number;
  crop: string;
  disease_detected: string;
  confidence: number;
  severity: string;
<<<<<<< HEAD
  treatment?: string | null;
=======
  treatment: string | null;
>>>>>>> origin/claude/gracious-wozniak-r1cyri
  image_source: string;
  image_url?: string | null;
  created_at: string;
}