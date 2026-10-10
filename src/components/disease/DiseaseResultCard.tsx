interface DiseaseResultCardProps {
  disease?: string;
  confidence?: number;
  treatment?: string;
  status?: string;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  healthy: {
    bg: "bg-green-50",
    border: "border-green-300",
    badge: "bg-green-100 text-green-800",
    badgeText: "Healthy",
  },
  disease: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-800",
    badgeText: "Disease Detected",
  },
  not_leaf: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badge: "bg-yellow-100 text-yellow-800",
    badgeText: "Not a Leaf",
  },
  uncertain: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    badge: "bg-orange-100 text-orange-800",
    badgeText: "Uncertain",
  },
  error: {
    bg: "bg-gray-50",
    border: "border-gray-300",
    badge: "bg-gray-100 text-gray-800",
    badgeText: "Error",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-white",
  border: "border-gray-200",
  badge: "",
  badgeText: "",
};

export default function DiseaseResultCard({
  disease = "Not analyzed yet",
  confidence = 0,
  treatment = "Select a crop, upload a leaf image, and click Analyze.",
  status,
}: DiseaseResultCardProps) {
  const style = status ? (STATUS_STYLES[status] || DEFAULT_STYLE) : DEFAULT_STYLE;

  return (
    <div className={`rounded-xl shadow p-6 border ${style.bg} ${style.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Disease Analysis Result</h2>
        {style.badgeText && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
            {style.badgeText}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-semibold">Result:</span>{" "}
          {disease}
        </div>

        <div>
          <span className="font-semibold">Confidence:</span>{" "}
          {confidence}%
          {status === "not_leaf" && (
            <span className="ml-2 text-sm text-yellow-600">
              (image does not appear to be a leaf)
            </span>
          )}
        </div>

        <div>
          <span className="font-semibold">Recommended Treatment:</span>
          <p className="mt-2 text-gray-600">{treatment}</p>
        </div>
      </div>
    </div>
  );
}
