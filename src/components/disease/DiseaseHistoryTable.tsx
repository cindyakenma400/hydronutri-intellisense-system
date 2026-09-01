"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";

import { DiseaseHistoryItem } from "@/types/disease";
import { formatDate } from "@/utils/formatDate";

interface DiseaseHistoryTableProps {
  items: DiseaseHistoryItem[];
}

export default function DiseaseHistoryTable({
  items,
}: DiseaseHistoryTableProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
                <th className="text-left py-2">Image</th>
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
                    {item.image_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewUrl(`http://localhost:8000${item.image_url}`)
                        }
                        className="block w-12 h-12 rounded overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`http://localhost:8000${item.image_url}`}
                          alt={`${item.crop} leaf`}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>

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

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Leaf preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
