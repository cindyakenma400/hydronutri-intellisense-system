export default function NPKChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        NPK Nutrient Levels
      </h2>

      <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
        <p className="text-gray-500">
          Nitrogen • Phosphorus • Potassium Chart
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <h3 className="font-semibold">N</h3>
          <p>45 ppm</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-semibold">P</h3>
          <p>60 ppm</p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <h3 className="font-semibold">K</h3>
          <p>25 ppm</p>
        </div>
      </div>
    </div>
  );
}