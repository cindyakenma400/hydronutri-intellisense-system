"use client";

import { ReactNode, useState } from "react";

interface DataTableProps {
  headers: string[];
  rows: ReactNode[][];

  // Optional shorter labels for phones, same order as headers.
  mobileHeaders?: string[];
}

// Rows shown at first and added per "Show more" tap; keeps long
// histories fast to render, especially on phones.
const PAGE_SIZE = 25;

export default function DataTable({
  headers,
  rows,
  mobileHeaders,
}: DataTableProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = rows.slice(0, visible);
  const remaining = rows.length - shown.length;

  // On phones the table is compacted (small text, tight cells, headers
  // allowed to wrap) so every column fits the screen at once. Sideways
  // scrolling stays as a fallback for very narrow screens.
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-[11px] sm:text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={header}
                  className="text-left align-bottom font-semibold px-[3px] py-2 sm:px-3 sm:py-3 md:p-4 md:whitespace-nowrap"
                >
                  {mobileHeaders?.[idx] ? (
                    <>
                      <span className="sm:hidden">{mobileHeaders[idx]}</span>
                      <span className="hidden sm:inline">{header}</span>
                    </>
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map((row, index) => (
              <tr
                key={index}
                className="border-t"
              >
                {row.map((cell, idx) => (
                  <td
                    key={idx}
                    className="px-[3px] py-2 sm:px-3 sm:py-3 md:p-4"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisible(visible + PAGE_SIZE)}
          className="w-full py-3 rounded-xl bg-white shadow text-sm font-medium text-green-700 hover:bg-green-50 transition"
        >
          Show more ({remaining} left)
        </button>
      )}
    </div>
  );
}
