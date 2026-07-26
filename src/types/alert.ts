export interface AlertItem {
  type: string;
  message: string;
}

export interface AlertResponse {
  total_alerts: number;
  alerts: AlertItem[];
}