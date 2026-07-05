export default function SuitabilityTable() {
  const data = [
    {
      crop: "Tomato",
      suitability: "92%",
      status: "Excellent",
    },
    {
      crop: "Onion",
      suitability: "85%",
      status: "Good",
    },
    {
      crop: "Maize",
      suitability: "78%",
      status: "Moderate",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Crop Suitability
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Crop</th>
            <th className="text-left p-2">Suitability</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.crop} className="border-b">
              <td className="p-2">{row.crop}</td>
              <td className="p-2">{row.suitability}</td>
              <td className="p-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}