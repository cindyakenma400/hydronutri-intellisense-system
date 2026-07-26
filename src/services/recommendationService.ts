import { apiGet } from "@/lib/api";
import {
  CropRecommendation,
  RecommendationHistoryItem,
} from "@/types/recommendation";

export function getCropRecommendation() {
  return apiGet<CropRecommendation>("/recommendations/crop");
}

export function getRecommendationHistory() {
  return apiGet<RecommendationHistoryItem[]>("/recommendations/history");
}