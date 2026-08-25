"use client";

import type { LucideIcon } from "lucide-react";

export function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800
                   outline-none focus:border-green-600 focus:ring-2
                   focus:ring-green-600/20 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </label>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800
                   outline-none focus:border-green-600 focus:ring-2
                   focus:ring-green-600/20 disabled:bg-gray-50 disabled:text-gray-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${
          checked ? "bg-green-700" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                      transition-transform ${
                        checked ? "translate-x-5.5" : "translate-x-0.5"
                      }`}
        />
      </button>
    </div>
  );
}

export function StatusIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        active ? "text-green-700" : "text-gray-500"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          active ? "bg-green-600" : "bg-gray-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function PreferenceCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          onClick={() => onChange(!checked)}
          className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${
            checked ? "bg-green-700" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                        transition-transform ${
                          checked ? "translate-x-5.5" : "translate-x-0.5"
                        }`}
          />
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>

      <StatusIndicator active={checked} />
    </div>
  );
}

export function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end mt-5">
      <button
        onClick={onSave}
        className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-800 transition"
      >
        Save changes
      </button>
    </div>
  );
}
