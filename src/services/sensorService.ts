import { apiGet } from "@/lib/api";
import { SensorReading } from "@/types/sensor";

export function getLatestReading() {
  return apiGet<SensorReading>("/sensor/latest");
}

export function getSensorHistory() {
  return apiGet<SensorReading[]>("/sensor/history");
}