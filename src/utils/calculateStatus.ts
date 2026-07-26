// Turns raw sensor values into readable status labels + colors
// used across the dashboard and fertilization pages.

export function moistureStatus(value: number) {
  if (value < 30) return { label: "Dry", color: "text-red-600" };
  if (value < 60) return { label: "Moderate", color: "text-yellow-600" };
  if (value <= 85) return { label: "Optimal", color: "text-green-600" };
  return { label: "Waterlogged", color: "text-red-600" };
}

export function phStatus(value: number) {
  if (value < 5.5) return { label: "Too Acidic", color: "text-red-600" };
  if (value <= 7.5) return { label: "Normal", color: "text-green-600" };
  return { label: "Too Alkaline", color: "text-red-600" };
}

export function ecStatus(value: number) {
  if (value <= 0) return { label: "No Data", color: "text-gray-500" };
  if (value < 0.8) return { label: "Low", color: "text-yellow-600" };
  if (value <= 2.5) return { label: "Healthy", color: "text-green-600" };
  return { label: "Saline Risk", color: "text-red-600" };
}

export function nutrientStatus(value: number, low: number, optimal: number) {
  if (value < low) return { label: "Low", color: "text-red-600" };
  if (value < optimal) return { label: "Medium", color: "text-yellow-600" };
  return { label: "Good", color: "text-green-600" };
}