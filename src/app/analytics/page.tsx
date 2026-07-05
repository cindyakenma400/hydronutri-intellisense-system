import PageHeader from "@/components/layout/PageHeader";

import MoistureChart from "@/components/analytics/MoistureChart";
import PHChart from "@/components/analytics/PHChart";
import ECChart from "@/components/analytics/ECChart";
import NPKChart from "@/components/analytics/NPKChart";
import DiseaseTrendChart from "@/components/analytics/DiseaseTrendChart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Historical trends and farm performance insights"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <MoistureChart />
        <PHChart />
        <ECChart />
        <NPKChart />
      </div>

      <DiseaseTrendChart />
    </div>
  );
}