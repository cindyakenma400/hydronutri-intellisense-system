import { DiseaseHistoryItem } from "@/types/disease";
import { formatDate } from "@/utils/formatDate";

interface DiseaseHistoryTableProps {
  items: DiseaseHistoryItem[];
}

export default function DiseaseHistoryTable({
  items,
}: DiseaseHistoryTableProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Disease Detection History
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500">
          No analyses yet. Upload a leaf image above to create the
          first record.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Crop</th>
                <th className="text-left py-2">Disease</th>
                <th className="text-left py-2">Confidence</th>
                <th className="text-left py-2">Severity</th>
                <th className="text-left py-2">Source</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">
                    {formatDate(item.created_at)}
                  </td>

                  <td className="py-3">{item.crop}</td>

                  <td className="py-3">
                    {item.disease_detected}
                  </td>

                  <td className="py-3">
                    {item.confidence}%
                  </td>

                  <td className="py-3">
                    {item.severity}
                  </td>

                  <td className="py-3 text-sm text-gray-500">
                    {item.image_source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}