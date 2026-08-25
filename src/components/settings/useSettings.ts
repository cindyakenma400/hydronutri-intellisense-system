"use client";

import { useCallback, useState } from "react";

import { DEFAULTS, STORAGE_KEY, Settings } from "./settingsTypes";

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* keep defaults */
  }
  return DEFAULTS;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const persist = useCallback(
    (message = "Settings saved.") => {
      setSettings((current) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        return current;
      });
      showToast(message);
    },
    [showToast]
  );

  const clearStored = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    showToast("Local settings cache cleared.");
  }, [showToast]);

  return { settings, update, persist, clearStored, toast, showToast };
}
