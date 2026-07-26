import { apiGet } from "@/lib/api";
import { DashboardSummary } from "@/types/dashboard";

export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/dashboard/summary");
}