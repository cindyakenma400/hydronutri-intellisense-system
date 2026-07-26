import { apiGet } from "@/lib/api";
import {
  FertilizationResult,
  FertilizationHistoryItem,
} from "@/types/crop";

export function getFertilizerRecommendation() {
  return apiGet<FertilizationResult>("/fertilization/recommend");
}

export function getFertilizationHistory() {
  return apiGet<FertilizationHistoryItem[]>("/fertilization/history");
}