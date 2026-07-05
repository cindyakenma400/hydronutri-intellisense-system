import PageHeader from "@/components/layout/PageHeader";

import NutrientCard from "@/components/fertilization/NutrientCard";
import NPKChart from "@/components/fertilization/NPKChart";
import FertilizerRecommendation from "@/components/fertilization/FertilizerRecommendation";

export default function FertilizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fertilization Management"
        description="Monitor nutrient levels and fertilizer recommendations"
      />

      <div className="grid md:grid-cols-3 gap-4">
        <NutrientCard
          nutrient="Nitrogen (N)"
          value="45 ppm"
          status="Optimal"
        />

        <NutrientCard
          nutrient="Phosphorus (P)"
          value="60 ppm"
          status="Healthy"
        />

        <NutrientCard
          nutrient="Potassium (K)"
          value="25 ppm"
          status="Low"
        />
      </div>

      <NPKChart />

      <FertilizerRecommendation />
    </div>
  );
}