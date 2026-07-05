import PageHeader from "@/components/layout/PageHeader";

import MoistureGauge from "@/components/irrigation/MoistureGauge";
import PumpIndicator from "@/components/irrigation/PumpIndicator";
import IrrigationRecommendation from "@/components/irrigation/IrrigationRecommendation";

export default function IrrigationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Irrigation Management"
        description="Monitor soil moisture and irrigation status"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <MoistureGauge />
        <PumpIndicator />
      </div>

      <IrrigationRecommendation />
    </div>
  );
}