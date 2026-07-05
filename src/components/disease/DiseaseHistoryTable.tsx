const history = [
  {
    date: "2026-06-15",
    crop: "Tomato",
    disease: "Early Blight",
    confidence: "92%",
  },
  {
    date: "2026-06-12",
    crop: "Onion",
    disease: "Purple Blotch",
    confidence: "88%",
  },
  {
    date: "2026-06-10",
    crop: "Maize",
    disease: "Leaf Rust",
    confidence: "90%",
  },
];

export default function DiseaseHistoryTable() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Disease Detection History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Date
              </th>

              <th className="text-left py-2">
                Crop
              </th>

              <th className="text-left py-2">
                Disease
              </th>

              <th className="text-left py-2">
                Confidence
              </th>
            </tr>
          </thead>

          <tbody>
            {history.map((item, index) => (
              <tr
                key={index}
                className="border-b"
              >
                <td className="py-3">
                  {item.date}
                </td>

                <td className="py-3">
                  {item.crop}
                </td>

                <td className="py-3">
                  {item.disease}
                </td>

                <td className="py-3">
                  {item.confidence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}