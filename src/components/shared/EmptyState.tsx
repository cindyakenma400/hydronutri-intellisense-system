interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({
  title,
  message,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="text-gray-500 mt-2">
        {message}
      </p>
    </div>
  );
}