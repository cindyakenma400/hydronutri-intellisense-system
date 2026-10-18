import { apiGet, apiUpload } from "@/lib/api";
import {
  DiseaseResult,
  DiseaseHistoryItem,
} from "@/types/disease";

export function analyzeDisease(file: File) {
  return apiUpload<DiseaseResult>("/disease/analyze", file, {
    source: "Web Upload",
  });
}

export function getDiseaseHistory() {
  return apiGet<DiseaseHistoryItem[]>("/disease/history");
}