interface PumpIndicatorProps {
  status?: "ON" | "OFF";
  mode?: string;
}

export default function PumpIndicator({
  status = "OFF",
  mode = "Auto Mode",
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

        <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {mode}
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