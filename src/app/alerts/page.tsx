import PageHeader from "@/components/layout/PageHeader";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Notifications"
        description="Important farm events and warnings"
      />

      <div className="space-y-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          ⚠ Low Soil Moisture Detected
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          ⚠ Potassium Deficiency Detected
        </div>

        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          ⚠ Early Blight Detected on Tomato Crop
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
          ℹ Irrigation System Activated Automatically
        </div>
      </div>
    </div>
  );
}