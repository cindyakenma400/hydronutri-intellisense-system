"use client";

import { NAV_SECTIONS, SectionId } from "./settingsTypes";

export default function SettingsNav({
  section,
  onSelect,
}: {
  section: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <nav className="lg:w-64 shrink-0 bg-white rounded-xl border shadow-sm p-2 lg:h-fit">
      <ul
        className="flex gap-1 overflow-x-auto pb-1 lg:pb-0
                   lg:flex-col lg:overflow-visible lg:space-y-1"
      >
        {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
          <li key={id} className="shrink-0 lg:shrink">
            <button
              type="button"
              onClick={() => onSelect(id)}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2.5 rounded-lg text-sm font-medium transition
                          lg:w-full lg:gap-3 ${
                section === id
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
