// Table date cell. Phones: date on top (13/8/2026), time under it
// (11:29). Larger screens: one line (13 Aug, 11:29).
export default function DateTimeCell({ iso }: { iso: string }) {
  const value = new Date(iso);

  // Built by hand: en-GB always zero-pads (13/08/2026).
  const date = `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
  const time = value.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const full = value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <span className="sm:hidden block whitespace-nowrap">{date}</span>
      <span className="sm:hidden block whitespace-nowrap text-gray-500">{time}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  );
}
