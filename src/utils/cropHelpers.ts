export function getBestCrop(moisture: number, ph: number) {
  if (moisture < 30) {
    return {
      crop: "Millet",
      reason: "Low moisture tolerance",
      score: 85,
    };
  }

  if (ph < 5.5) {
    return {
      crop: "Cassava",
      reason: "Tolerates acidic soil",
      score: 80,
    };
  }

  return {
    crop: "Maize",
    reason: "Balanced soil conditions",
    score: 90,
  };
}