"use client";

import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import SettingsNav from "@/components/settings/SettingsNav";
import { useSettings } from "@/components/settings/useSettings";
import { SectionId } from "@/components/settings/settingsTypes";
import GeneralSection from "@/components/settings/sections/GeneralSection";
import ProfileSection from "@/components/settings/sections/ProfileSection";
import SecuritySection from "@/components/settings/sections/SecuritySection";
import NotificationsSection from "@/components/settings/sections/NotificationsSection";
import {
  IrrigationSection,
  FertilizationSection,
  SoilQualitySection,
  DiseaseDetectionSection,
} from "@/components/settings/sections/AutomationSections";
import DevicesSection from "@/components/settings/sections/DevicesSection";
import PrivacySection from "@/components/settings/sections/PrivacySection";
import AboutSection from "@/components/settings/sections/AboutSection";

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId>("general");
  const { settings, update, persist, clearStored, toast, showToast } = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="System configuration and farm profile"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsNav section={section} onSelect={setSection} />

        <div className="flex-1 space-y-6 min-w-0">
          {section === "general" && (
            <GeneralSection settings={settings} update={update} persist={persist} />
          )}
          {section === "profile" && (
            <ProfileSection settings={settings} update={update} persist={persist} />
          )}
          {section === "security" && <SecuritySection showToast={showToast} />}
          {section === "notifications" && (
            <NotificationsSection settings={settings} update={update} persist={persist} />
          )}
          {section === "irrigation" && (
            <IrrigationSection settings={settings} update={update} persist={persist} />
          )}
          {section === "fertilization" && (
            <FertilizationSection settings={settings} update={update} persist={persist} />
          )}
          {section === "soilQuality" && (
            <SoilQualitySection settings={settings} update={update} persist={persist} />
          )}
          {section === "disease" && (
            <DiseaseDetectionSection settings={settings} update={update} persist={persist} />
          )}
          {section === "devices" && <DevicesSection />}
          {section === "privacy" && (
            <PrivacySection clearStored={clearStored} showToast={showToast} />
          )}
          {section === "about" && <AboutSection />}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm
                        font-medium px-4 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
