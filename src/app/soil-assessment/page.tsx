import PageHeader from "@/components/layout/PageHeader";
import SoilSummaryCard from "@/components/soil/SoilSummaryCard";
import CropRankingCard from "@/components/soil/CropRankingCard";
import SuitabilityTable from "@/components/soil/SuitabilityTable";

export default function SoilAssessmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Soil Assessment"
        description="Analyze soil conditions and crop suitability"
      />

      <SoilSummaryCard
        moisture={45}
        ph={6.8}
        nitrogen={45}
        phosphorus={60}
        potassium={25}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <CropRankingCard />
        <SuitabilityTable />
      </div>
    </div>
  );
}