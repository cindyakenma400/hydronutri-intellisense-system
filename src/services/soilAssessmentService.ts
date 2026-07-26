import { apiGet } from "@/lib/api";
import { SoilAssessment } from "@/types/crop";

export function analyzeSoil() {
  return apiGet<SoilAssessment>("/soil/analyze");
}