
export default function DiseaseAlertCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Disease Detection
      </h2>

      <div className="mt-4">
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          Leaf Image
        </div>

        <p className="mt-4">
          Disease:
          <span className="text-red-600 font-bold ml-2">
            Early Blight
          </span>
        </p>

        <p className="mt-2">
          Confidence:
          <span className="font-bold ml-2">
            92%
          </span>
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Apply approved pesticide and remove infected leaves.
        </p>

        <button className="mt-4 bg-green-700 text-white px-4 py-2 rounded-lg">
          Upload Leaf Image
        </button>
      </div>
    </div>
  );
}