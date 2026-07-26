import Link from "next/link";

export default function DiseaseAlertCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Disease Detection
      </h2>

      <div className="mt-4">
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          Leaf Image
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Upload a leaf photo to analyze your crop for diseases
          using the AI model.
        </p>

        <Link
          href="/disease-detection"
          className="mt-4 inline-block bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Upload Leaf Image
        </Link>
      </div>
    </div>
  );
}