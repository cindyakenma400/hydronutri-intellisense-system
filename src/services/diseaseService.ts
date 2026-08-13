import { apiGet, apiUpload } from "@/lib/api";
import {
  DiseaseResult,
  DiseaseHistoryItem,
} from "@/types/disease";

export function analyzeDisease(file: File, crop: string = "tomato") {
  return apiUpload<DiseaseResult>("/disease/analyze", file, {
    crop,
    source: "Web Upload",
  });
}

export function getDiseaseHistory() {
  return apiGet<DiseaseHistoryItem[]>("/disease/history");
}