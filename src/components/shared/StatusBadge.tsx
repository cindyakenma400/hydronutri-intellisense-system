interface StatusBadgeProps {
  status: "Healthy" | "Warning" | "Critical" | "Online" | "Offline";
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles = {
    Healthy: "bg-green-100 text-green-700",
    Warning: "bg-yellow-100 text-yellow-700",
    Critical: "bg-red-100 text-red-700",
    Online: "bg-green-100 text-green-700",
    Offline: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}