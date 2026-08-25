"use client";

import { Card } from "../ui";

export default function AboutSection() {
  return (
    <Card title="About" subtitle="Project information">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-6 border-b pb-3">
          <dt className="shrink-0 text-gray-600">App name</dt>
          <dd className="text-right text-gray-800 font-medium">HydroNutri IntelliSense</dd>
        </div>
        <div className="flex justify-between gap-6 border-b pb-3">
          <dt className="shrink-0 text-gray-600">Version</dt>
          <dd className="text-right text-gray-800">1.0.0</dd>
        </div>
        <div className="flex justify-between gap-6 border-b pb-3">
          <dt className="shrink-0 text-gray-600">Description</dt>
          <dd className="text-right text-gray-800">
            Smart agriculture IoT platform for Ghana smallholder farmers
          </dd>
        </div>
        <div className="flex justify-between gap-6 pb-1">
          <dt className="shrink-0 text-gray-600">Supported crops</dt>
          <dd className="text-right text-gray-800">Maize, Tomato, Onion</dd>
        </div>
      </dl>
    </Card>
  );
}
