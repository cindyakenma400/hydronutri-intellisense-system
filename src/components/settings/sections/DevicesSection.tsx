"use client";

import { Card, StatusIndicator } from "../ui";
import { DEVICES } from "../settingsTypes";

export default function DevicesSection() {
  return (
    <Card
      title="Connected Devices"
      subtitle="Hardware linked to this installation"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {DEVICES.map(({ name, model, icon: Icon, online }) => (
          <div key={name} className="rounded-xl border p-4 flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              online ? "bg-green-50" : "bg-gray-100"
            }`}>
              <Icon className={`h-5 w-5 ${online ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">{name}</p>
              <p className="text-xs text-gray-500 mb-1.5">{model}</p>
              <StatusIndicator active={online} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
