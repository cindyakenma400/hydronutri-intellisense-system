import Image from "next/image";

interface DiseaseImageViewerProps {
  imageUrl?: string;
}

export default function DiseaseImageViewer({
  imageUrl,
}: DiseaseImageViewerProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Uploaded Leaf Image
      </h2>

      <div className="relative border rounded-lg overflow-hidden h-72 bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Leaf"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">
              No image uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}