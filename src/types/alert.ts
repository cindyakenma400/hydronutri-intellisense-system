export type AlertSeverity = "critical" | "warning" | "info";

export interface AlertItem {
  id: number;
  alert_type: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean;
  created_at: string;
}

export interface AlertResponse {
  total_alerts: number;
  unread_count: number;
  alerts: AlertItem[];
}

export interface MarkReadResponse {
  updated: number;
  unread_count: number;
}