import { Camera } from "lucide-react";
import { DiseaseHistoryItem } from "@/types/disease";
import { API_BASE_URL } from "@/lib/api";

interface CapturedLeafCardProps {
  capture: DiseaseHistoryItem | null;
}

export default function CapturedLeafCard({ capture }: CapturedLeafCardProps) {
  if (!capture) {
    return (
      <div className="flex items-center gap-3 text-gray-500 py-4">
        <Camera className="w-6 h-6" />
        <p className="text-sm">
          No captured leaves yet. The ESP32-CAM will send images here
          automatically when it scans a leaf.
        </p>
      </div>
    );
  }

  const isHealthy = capture.disease_detected === "Healthy";
  const isUnknown = capture.disease_detected === "Unknown" || capture.disease_detected === "Uncertain";

  const treatments = capture.treatment && capture.treatment !== "None"
    ? capture.treatment.split(". ").filter(Boolean)
    : [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="relative border rounded-lg overflow-hidden h-72 bg-gray-100">
        {capture.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE_URL}${capture.image_url}`}
            alt={`${capture.crop} leaf`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-semibold">Crop Detected:</span>{" "}
          {capture.crop}
        </div>
        <div>
          <span className="font-semibold">Disease:</span>{" "}
          <span className={
            isHealthy ? "text-green-700" : isUnknown ? "text-gray-500" : "text-red-600"
          }>
            {capture.disease_detected}
          </span>
        </div>
        <div>
          <span className="font-semibold">Confidence:</span>{" "}
          {capture.confidence}%
        </div>
        <div>
          <span className="font-semibold">Severity:</span>{" "}
          {capture.severity}
        </div>
        <div>
          <span className="font-semibold">Recommended Treatment:</span>
          {treatments.length > 0 ? (
            <ul className="mt-1 list-disc list-inside text-gray-600 text-sm space-y-1">
              {treatments.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-gray-600 text-sm">
              {isHealthy ? "No action needed. Keep monitoring." : "No treatment information available."}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400 pt-2">
          Captured: {new Date(capture.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
