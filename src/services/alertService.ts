import { apiGet } from "@/lib/api";
import { AlertResponse } from "@/types/alert";

export function getAlerts() {
  return apiGet<AlertResponse>("/alerts/");
}