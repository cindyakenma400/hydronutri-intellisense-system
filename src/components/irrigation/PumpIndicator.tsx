 interface PumpIndicatorProps {
  status?: "ON" | "OFF";
}

export default function PumpIndicator({
  status = "ON",
}: PumpIndicatorProps) {
  const isOn = status === "ON";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Pump Status
      </h2>

      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full ${
            isOn
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />

        <span className="text-2xl font-bold">
          {status}
        </span>
      </div>

      <p className="text-gray-500 mt-3">
        {isOn
          ? "Irrigation system is currently running."
          : "Irrigation system is currently inactive."}
      </p>
    </div>
  );
}