import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Axis and margin sizes for the line charts. On phones the Y axis is
// narrowed and the right margin matches its width, so the plot sits in
// the middle of its card instead of hugging the right edge.
export function useChartLayout() {
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );

  return mobile
    ? { yAxisWidth: 32, margin: { top: 8, right: 32, bottom: 0, left: 0 } }
    : { yAxisWidth: 60, margin: { top: 5, right: 5, bottom: 5, left: 0 } };
}
