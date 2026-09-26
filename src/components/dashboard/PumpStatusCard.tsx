interface PumpStatusCardProps {
  irrigationStatus?: string;
  autoMode?: boolean;
  pumpOn?: boolean;
}

// pumpOn is the backend's pump state, the same value the ESP32 switches
// the relay from, so this card always shows what the pump is doing.
export default function PumpStatusCard({
  irrigationStatus = "Unknown",
  autoMode = true,
  pumpOn = false,
}: PumpStatusCardProps) {

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-lg">
        Irrigation Pump
      </h2>

      <div className="mt-4">
        <p
          className={`text-3xl font-bold ${
            pumpOn ? "text-green-600" : "text-gray-400"
          }`}
        >
          {pumpOn ? "ON" : "OFF"}
        </p>

        <p className="mt-2 text-gray-500">
          {autoMode ? "Auto Mode Enabled" : "Manual Mode"}
        </p>

        <p className="text-sm text-gray-400 mt-1">
          {autoMode
            ? irrigationStatus
            : "Controlled by the System Controls buttons"}
        </p>
      </div>
    </div>
  );
}