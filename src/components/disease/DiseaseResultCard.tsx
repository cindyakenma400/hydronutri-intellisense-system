interface DiseaseResultCardProps {
  disease?: string;
  confidence?: number;
  treatment?: string;
}

export default function DiseaseResultCard({
  disease = "Early Blight",
  confidence = 92,
  treatment = "Apply fungicide and remove infected leaves.",
}: DiseaseResultCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Disease Analysis Result
      </h2>

      <div className="space-y-3">
        <div>
          <span className="font-semibold">
            Disease:
          </span>{" "}
          {disease}
        </div>

        <div>
          <span className="font-semibold">
            Confidence:
          </span>{" "}
          {confidence}%
        </div>

        <div>
          <span className="font-semibold">
            Recommended Treatment:
          </span>
          <p className="mt-2 text-gray-600">
            {treatment}
          </p>
        </div>
      </div>
    </div>
  );
}