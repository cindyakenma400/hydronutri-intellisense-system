"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";

import { DiseaseHistoryItem } from "@/types/disease";
import { API_BASE_URL } from "@/lib/api";
import DateTimeCell from "@/components/shared/DateTimeCell";

// Full labels on larger screens, short ones on phones so every column
// fits the screen at once. On phones Crop is shown above the disease and
// Confidence under the severity, so those two columns are hidden there.
const COLUMNS = [
  { label: "Image", short: "Leaf" },
  { label: "Date", short: "Date" },
  { label: "Crop", short: "", phoneHidden: true },
  { label: "Disease", short: "Crop / Disease" },
  { label: "Confidence", short: "", phoneHidden: true },
  { label: "Severity", short: "Sev. / Conf." },
  { label: "Source", short: "Src" },
];

const PHONE_HIDDEN = "hidden sm:table-cell";

// Cells are tight on phones and roomy from sm up.
const CELL = "text-left px-1 py-2 sm:px-2 sm:py-3";

interface DiseaseHistoryTableProps {
  items: DiseaseHistoryItem[];
}

export default function DiseaseHistoryTable({
  items,
}: DiseaseHistoryTableProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">
        Disease Detection History
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500">
          No analyses yet. Upload a leaf image above to create the
          first record.
        </p>
      ) : (
        // On phones the table uses the card's side padding too.
        <div className="-mx-2 sm:mx-0 overflow-x-auto">
          <table className="w-full text-[11px] sm:text-sm md:text-base">
            <thead>
              <tr className="border-b">
                {COLUMNS.map(({ label, short, phoneHidden }) => (
                  <th
                    key={label}
                    className={`${CELL} align-bottom font-semibold ${phoneHidden ? PHONE_HIDDEN : ""}`}
                  >
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className={CELL}>
                    {item.image_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewUrl(`${API_BASE_URL}${item.image_url}`)
                        }
                        className="block w-8 h-8 sm:w-12 sm:h-12 rounded overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${API_BASE_URL}${item.image_url}`}
                          alt={`${item.crop} leaf`}
                          className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded"
                        />
                      </button>
                    ) : (
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded bg-gray-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>

                  <td className={CELL}>
                    <DateTimeCell iso={item.created_at} />
                  </td>

                  <td className={`${CELL} ${PHONE_HIDDEN}`}>{item.crop}</td>

                  <td className={CELL}>
                    <span className="sm:hidden block text-gray-500">{item.crop}</span>
                    {item.disease_detected}
                  </td>

                  <td className={`${CELL} ${PHONE_HIDDEN}`}>
                    {item.confidence}%
                  </td>

                  <td className={CELL}>
                    {item.severity}
                    <span className="sm:hidden block text-gray-500">{item.confidence}%</span>
                  </td>

                  {/* Wraps by words ("Web Upload" / "(leaf.jpg)"), never
                      letter by letter. */}
                  <td className={`${CELL} text-gray-500 min-w-16 sm:min-w-0`}>
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
