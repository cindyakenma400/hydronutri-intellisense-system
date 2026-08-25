"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Card, Field } from "../ui";
import { Settings } from "../settingsTypes";

export default function ProfileSection({
  settings,
  update,
  persist,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  persist: (message?: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Card
      title="Profile"
      subtitle="Your personal details"
      action={
        editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
                persist();
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded-lg transition"
            >
              <Check size={15} /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <X size={15} /> Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            <Pencil size={15} /> Edit
          </button>
        )
      }
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 shrink-0 rounded-full bg-green-700 text-white flex items-center justify-center text-2xl font-semibold">
          {(settings.farmerName || "F").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {settings.farmerName || "Farmer"}
          </p>
          <p className="text-sm text-gray-500 truncate">{settings.email || "No email set"}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Farmer Name" value={settings.farmerName}
          disabled={!editing}
          placeholder="Full name"
          onChange={(v) => update("farmerName", v)} />
        <Field label="Email" type="email" value={settings.email}
          disabled={!editing}
          placeholder="name@example.com"
          onChange={(v) => update("email", v)} />
        <Field label="Phone" type="tel" value={settings.phone}
          disabled={!editing}
          placeholder="+233 ..."
          onChange={(v) => update("phone", v)} />
        <Field label="Location" value={settings.location}
          disabled={!editing}
          placeholder="Accra, Ghana"
          onChange={(v) => update("location", v)} />
      </div>
    </Card>
  );
}
