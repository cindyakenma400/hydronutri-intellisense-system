"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { apiGet, apiPost } from "@/lib/api";
import { AlertResponse } from "@/types/alert";
import { getUser, logout, AuthUser } from "@/services/authService";
import { NavLinks } from "@/components/layout/Sidebar";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [online, setOnline] = useState(true);
  const [alerts, setAlerts] = useState<AlertResponse | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user] = useState<AuthUser | null>(() => getUser());
  const menuRef = useRef<HTMLDivElement>(null);

  // Check backend status + fetch alerts, refreshed every 10s
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        await apiGet("/");
        const alertData = await apiGet<AlertResponse>("/alerts/");

        if (!active) return;

        setOnline(true);
        setAlerts(alertData);
      } catch {
        if (!active) return;
        setOnline(false);
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Close dropdowns when clicking anywhere else
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowAlerts(false);
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close the mobile menu whenever the route changes (including the
  // browser back button), not only when a menu link is tapped.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // While the mobile menu is open: Escape closes it and the page behind
  // it does not scroll.
  useEffect(() => {
    if (!menuOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const alertCount = alerts?.unread_count ?? 0;
  const displayName = user?.full_name ?? "Farmer";

  async function handleOpenAlerts() {
    const opening = !showAlerts;
    setShowAlerts(opening);
    setShowProfile(false);

    if (opening && (alerts?.unread_count ?? 0) > 0) {
      try {
        await apiPost("/alerts/read-all");
        const alertData = await apiGet<AlertResponse>("/alerts/");
        setAlerts(alertData);
      } catch {
        // ignore, next poll will retry
      }
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setShowAlerts(false);
            setShowProfile(false);
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="lg:hidden -ml-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          {/* Both icons stay mounted and cross-fade with a quarter turn. */}
          <span className="relative block w-6 h-6">
            <Menu
              size={24}
              className={`absolute inset-0 transition duration-300 ease-out ${
                menuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              size={24}
              className={`absolute inset-0 transition duration-300 ease-out ${
                menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              }`}
            />
          </span>
        </button>

        <h2 className="font-semibold text-lg lg:text-xl text-gray-800 truncate">
          <span className="lg:hidden">HydroNutri</span>
          <span className="hidden lg:inline">Smart Agriculture Platform</span>
        </h2>
      </div>

      <div
        ref={menuRef}
        className="flex items-center gap-4 lg:gap-6"
      >
        <div
          className="flex items-center gap-2"
          title={online ? "System Online" : "Backend Offline"}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              online ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="hidden sm:inline text-sm text-gray-600">
            {online ? "System Online" : "Backend Offline"}
          </span>
        </div>

        {/* Alerts bell */}
        <div className="relative">
          <button
            onClick={handleOpenAlerts}
            className="relative p-1 rounded-full hover:bg-gray-100 transition"
          >
            <Bell className="text-gray-700" />

            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute -right-14 sm:right-0 mt-3 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-xl shadow-lg border z-50 origin-top-right animate-pop-in">
              <div className="p-4 border-b font-semibold text-gray-800">
                Notifications ({alertCount})
              </div>

              <div className="max-h-72 overflow-y-auto">
                {!alerts || alerts.alerts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    No active alerts. All readings are normal.
                  </p>
                ) : (
                  alerts.alerts.map((alert) => (
                    <div
                      key={`${alert.alert_type}-${alert.id}`}
                      className="p-4 border-b text-sm"
                    >
                      <p className="font-medium text-gray-800">
                        {alert.alert_type}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/alerts"
                onClick={() => setShowAlerts(false)}
                className="block p-3 text-center text-sm text-green-700 hover:bg-gray-50 font-medium"
              >
                View all alerts
              </Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowAlerts(false);
            }}
            className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition"
          >
            {displayName.charAt(0).toUpperCase()}
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border z-50 origin-top-right animate-pop-in">
              <div className="p-4 border-b">
                <p className="font-semibold text-gray-800">
                  {displayName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {user?.email ?? "HydroNutri-IntelliSense"}
                </p>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings size={18} />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-sm text-red-600 hover:bg-red-50 border-t"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dims the page; tapping it closes the menu. Stays mounted so it
          can fade out as well as in. */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 -z-10 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* The clip box sits just under the bar; the panel slides down out
          of it, so it never passes over the bar itself. inert keeps the
          hidden links out of keyboard and screen reader reach. */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 overflow-hidden transition-[visibility] duration-300 ${
          menuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        inert={!menuOpen}
      >
        <div
          id="mobile-menu"
          className={`bg-green-900 text-white shadow-lg max-h-[calc(100dvh-4rem)] overflow-y-auto transition-transform duration-300 ease-out ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <NavLinks onNavigate={() => setMenuOpen(false)} revealed={menuOpen} />
        </div>
      </div>
    </header>
  );
}