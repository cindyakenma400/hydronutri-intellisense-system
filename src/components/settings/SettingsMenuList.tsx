"use client";

import { NAV_SECTIONS, SectionId } from "./settingsTypes";

// Mobile first level of Settings: one full-width row per section.
// Tapping a row opens that section as the second level.
export default function SettingsMenuList({
  onSelect,
}: {
  onSelect: (id: SectionId) => void;
}) {
  return (
    <nav
      aria-label="Settings sections"
      className="bg-white rounded-xl border shadow-sm overflow-hidden"
    >
      <ul className="divide-y">
        {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-green-50"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                <Icon size={20} />
              </span>

              <span className="font-medium text-gray-800">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
