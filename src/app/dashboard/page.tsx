import PageHeader from "@/components/layout/PageHeader";

import KPICard from "@/components/dashboard/KPICards";
import FarmHealthScore from "@/components/dashboard/FarmHealthScore";
import SensorOverview from "@/components/dashboard/SensorOverview";
import DiseaseAlertCard from "@/components/dashboard/DiseaseAlertCard";
import CropRecommendation from "@/components/dashboard/CropRecommendationCard";
import FertilizationStatusCard from "@/components/dashboard/FertilizerStatusCard";
import PumpStatusCard from "@/components/dashboard/PumpStatusCard";
import SystemControl from "@/components/dashboard/SystemControls";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your smart farm"
      />

      <div className="grid md:grid-cols-4 gap-4">
        <KPICard
          title="Soil Moisture"
          value="45%"
          status="Optimal"
        />

        <KPICard
          title="pH Level"
          value="6.8"
          status="Normal"
        />

        <KPICard
          title="EC Level"
          value="1.2 dS/m"
          status="Healthy"
        />

        <KPICard
          title="Best Crop"
          value="Onion"
          status="92% Suitable"
        />
      </div>

      <FarmHealthScore />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SensorOverview />
        </div>

        <DiseaseAlertCard />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <CropRecommendation />
        <PumpStatusCard />
        <FertilizationStatusCard />
      </div>

      <SystemControl />
    </div>
  );
}