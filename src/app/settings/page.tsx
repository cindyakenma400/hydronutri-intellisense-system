"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import SettingsNav from "@/components/settings/SettingsNav";
import SettingsMenuList from "@/components/settings/SettingsMenuList";
import { useSettings } from "@/components/settings/useSettings";
import { NAV_SECTIONS, SectionId } from "@/components/settings/settingsTypes";
import { NAV_RESELECT_EVENT } from "@/components/layout/Sidebar";
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

const DESKTOP_QUERY = "(min-width: 1024px)";

function sectionFromHash(): SectionId | null {
  const hash = window.location.hash.slice(1);
  return NAV_SECTIONS.some((s) => s.id === hash) ? (hash as SectionId) : null;
}

export default function SettingsPage() {
  // The open section lives in the URL hash (/settings#profile), so the
  // phone's back button or swipe returns from a section to the list.
  // null means no section is open: the list on mobile, General on desktop.
  const [openSection, setOpenSection] = useState<SectionId | null>(null);
  const [direction, setDirection] = useState<"forward" | "back" | "none">("none");
  const pushedEntry = useRef(false);
  const { settings, update, persist, clearStored, toast, showToast } = useSettings();

  const section: SectionId = openSection ?? "general";
  const listLabel = NAV_SECTIONS.find((s) => s.id === section)?.label;

  useEffect(() => {
    // Reads the hash once on load, then follows back/forward navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenSection(sectionFromHash());

    function handlePop() {
      pushedEntry.current = false;
      setDirection("back");
      setOpenSection(sectionFromHash());
    }

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  function select(id: SectionId) {
    if (id === openSection) return;

    if (window.matchMedia(DESKTOP_QUERY).matches) {
      // Desktop: switching sections is not a navigation step.
      window.history.replaceState(null, "", `#${id}`);
      setDirection("none");
    } else {
      window.history.pushState(null, "", `#${id}`);
      pushedEntry.current = true;
      setDirection("forward");
      window.scrollTo({ top: 0 });
    }

    setOpenSection(id);
  }

  const backToList = useCallback(() => {
    if (pushedEntry.current) {
      // Popping our own entry keeps browser history tidy; the popstate
      // handler then shows the list.
      window.history.back();
      return;
    }

    // Opened straight from a link such as /settings#profile.
    window.history.replaceState(null, "", window.location.pathname);
    setDirection("back");
    setOpenSection(null);
    window.scrollTo({ top: 0 });
  }, []);

  // Tapping Settings in the menu while already on Settings goes back to
  // the list, as users expect from a tab they are already on.
  useEffect(() => {
    function handleReselect(event: Event) {
      const href = (event as CustomEvent<string>).detail;
      if (href === "/settings" && sectionFromHash()) backToList();
    }

    window.addEventListener(NAV_RESELECT_EVENT, handleReselect);
    return () => window.removeEventListener(NAV_RESELECT_EVENT, handleReselect);
  }, [backToList]);

  const mobileAnimation =
    direction === "forward"
      ? "animate-slide-in"
      : direction === "back"
        ? "animate-slide-back"
        : "animate-page-in";

  return (
    <div className="space-y-6">
      {/* On mobile the section's own title replaces this header. */}
      <div className={openSection ? "hidden lg:block" : ""}>
        <PageHeader
          title="Settings"
          description="System configuration and farm profile"
        />
      </div>

      {/* Mobile, first level: the list of sections. */}
      {openSection === null && (
        <div className={`lg:hidden ${mobileAnimation}`}>
          <SettingsMenuList onSelect={select} />
        </div>
      )}

      {/* Second level on mobile; the normal two-column page on desktop. */}
      <div
        className={`${openSection ? "flex" : "hidden lg:flex"} flex-col lg:flex-row gap-6`}
      >
        <div className="hidden lg:block">
          <SettingsNav section={section} onSelect={select} />
        </div>

        <div
          key={section}
          className={`flex-1 space-y-6 min-w-0 ${mobileAnimation} lg:animate-page-in`}
        >
          <div className="lg:hidden">
            <button
              type="button"
              onClick={backToList}
              className="-ml-2 px-2 py-1.5 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 transition"
            >
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">
              {listLabel}
            </h1>
          </div>

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
