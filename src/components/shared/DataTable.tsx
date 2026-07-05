interface DataTableProps {
  headers: string[];
  rows: string[][];
}

export default function DataTable({
  headers,
  rows,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="text-left p-4"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-t"
            >
              {row.map((cell, idx) => (
                <td
                  key={idx}
                  className="p-4"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}