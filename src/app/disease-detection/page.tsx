import PageHeader from "@/components/layout/PageHeader";

import DiseaseImageViewer from "@/components/disease/DiseaseImageViewer";
import DiseaseResultCard from "@/components/disease/DiseaseResultCard";
import DiseaseHistoryTable from "@/components/disease/DiseaseHistoryTable";

export default function DiseaseDetectionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Disease Detection"
        description="AI-powered crop disease identification"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <DiseaseImageViewer />
        <DiseaseResultCard />
      </div>

      <DiseaseHistoryTable />
    </div>
  );
}