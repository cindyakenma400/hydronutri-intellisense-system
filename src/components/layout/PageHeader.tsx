interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        {title}
      </h1>

      <p className="text-gray-500 mt-2">
        {description}
      </p>
    </div>
  );
}