"use client";

import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPutJson } from "@/lib/api";
import { DEFAULTS, STORAGE_KEY, Settings } from "./settingsTypes";

// The subset of Settings that is persisted in the backend's
// system_settings table (farm/profile fields stay local-only).
type BackendSettings = {
  auto_irrigation: boolean;
  moisture_trigger: number;
  max_pump_minutes: number;
  auto_fertilization: boolean;
  npk_trigger: number;
  fertilizer_duration_seconds: number;
  soil_quality_assessment: boolean;
  assessment_frequency_hours: number;
  disease_detection: boolean;
  confidence_threshold: number;
  notify_in_app: boolean;
  notify_email: boolean;
  notify_soil_moisture: boolean;
  notify_irrigation: boolean;
  notify_fertilization: boolean;
  notify_soil_quality: boolean;
  notify_disease: boolean;
  notify_system: boolean;
};

function toBackend(settings: Settings): BackendSettings {
  return {
    auto_irrigation: settings.autoIrrigation,
    moisture_trigger: settings.moistureTrigger,
    max_pump_minutes: settings.maxPumpMinutes,
    auto_fertilization: settings.autoFertilization,
    npk_trigger: settings.npkTrigger,
    fertilizer_duration_seconds: settings.fertilizerDurationSeconds,
    soil_quality_assessment: settings.soilQualityAssessment,
    assessment_frequency_hours: settings.assessmentFrequencyHours,
    disease_detection: settings.diseaseDetection,
    confidence_threshold: settings.confidenceThreshold,
    notify_in_app: settings.notifyInApp,
    notify_email: settings.notifyEmail,
    notify_soil_moisture: settings.notifySoilMoisture,
    notify_irrigation: settings.notifyIrrigation,
    notify_fertilization: settings.notifyFertilization,
    notify_soil_quality: settings.notifySoilQuality,
    notify_disease: settings.notifyDisease,
    notify_system: settings.notifySystem,
  };
}

function fromBackend(current: Settings, backend: BackendSettings): Settings {
  return {
    ...current,
    autoIrrigation: backend.auto_irrigation,
    moistureTrigger: backend.moisture_trigger,
    maxPumpMinutes: backend.max_pump_minutes,
    autoFertilization: backend.auto_fertilization,
    npkTrigger: backend.npk_trigger,
    fertilizerDurationSeconds: backend.fertilizer_duration_seconds,
    soilQualityAssessment: backend.soil_quality_assessment,
    assessmentFrequencyHours: backend.assessment_frequency_hours,
    diseaseDetection: backend.disease_detection,
    confidenceThreshold: backend.confidence_threshold,
    notifyInApp: backend.notify_in_app,
    notifyEmail: backend.notify_email,
    notifySoilMoisture: backend.notify_soil_moisture,
    notifyIrrigation: backend.notify_irrigation,
    notifyFertilization: backend.notify_fertilization,
    notifySoilQuality: backend.notify_soil_quality,
    notifyDisease: backend.notify_disease,
    notifySystem: backend.notify_system,
  };
}

function loadCached(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* keep defaults */
  }
  return DEFAULTS;
}

function cacheLocally(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable */
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadCached);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // On mount, pull the source of truth from the backend. If it's
  // unreachable, the settings loaded from localStorage above stand in.
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const backend = await apiGet<BackendSettings>("/settings/");
        if (!active) return;

        setSettings((current) => {
          const merged = fromBackend(current, backend);
          cacheLocally(merged);
          return merged;
        });
      } catch {
        // Backend not reachable; keep using the cached/local settings.
      }
    }

    load();

    return () => {
      active = false;
    };
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
        cacheLocally(current);

        apiPutJson<BackendSettings>("/settings/", toBackend(current))
          .then((backend) => {
            setSettings((latest) => {
              const merged = fromBackend(latest, backend);
              cacheLocally(merged);
              return merged;
            });
          })
          .catch(() => {
            // Backend not reachable; the local cache above already has
            // the change, and it will sync next time /settings/ succeeds.
          });

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
