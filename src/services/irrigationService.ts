import { apiGet } from "@/lib/api";
import {
  IrrigationStatus,
  IrrigationHistoryItem,
} from "@/types/sensor";

export function getIrrigationStatus() {
  return apiGet<IrrigationStatus>("/irrigation/status");
}

export function getIrrigationHistory() {
  return apiGet<IrrigationHistoryItem[]>("/irrigation/history");
}