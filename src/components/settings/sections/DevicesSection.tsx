"use client";

import { useEffect, useState } from "react";
import { Camera, Cpu, Droplets, FlaskConical, Gauge, type LucideIcon } from "lucide-react";

import { apiGet } from "@/lib/api";
import { Card, StatusIndicator } from "../ui";

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  Camera,
  Gauge,
  Droplets,
  FlaskConical,
};

type DeviceStatusResponse = {
  name: string;
  model: string;
  icon: string;
  online: boolean;
};

export default function DevicesSection() {
  const [devices, setDevices] = useState<DeviceStatusResponse[] | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiGet<DeviceStatusResponse[]>("/devices/status");
        if (active) setDevices(data);
      } catch {
        if (active) setDevices([]);
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <Card
      title="Connected Devices"
      subtitle="Hardware linked to this installation"
    >
      {devices === null ? (
        <p className="text-sm text-gray-500">Loading device status...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {devices.map(({ name, model, icon, online }) => {
            const Icon = ICONS[icon] ?? Cpu;

            return (
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
            );
          })}
        </div>
      )}
    </Card>
  );
}
