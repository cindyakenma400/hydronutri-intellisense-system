
export default function SensorOverview() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg mb-4">
        Real-Time Sensor Readings
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          Moisture Chart
        </div>

        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          pH Chart
        </div>

        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          NPK Chart
        </div>

        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          EC Chart
        </div>
      </div>
    </div>
  );
}