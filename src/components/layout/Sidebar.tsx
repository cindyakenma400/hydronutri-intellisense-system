"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Droplets,
  FlaskConical,
  Leaf,
  BarChart3,
  Bell,
  Lightbulb,
  History,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Soil Assessment",
    href: "/soil-assessment",
    icon: Sprout,
  },
  {
    name: "Irrigation",
    href: "/irrigation",
    icon: Droplets,
  },
  {
    name: "Fertilization",
    href: "/fertilization",
    icon: FlaskConical,
  },
  {
    name: "Disease Detection",
    href: "/disease-detection",
    icon: Leaf,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// Fired with the link's href when the current page's own menu link is
// tapped, so a page can reset itself (Settings returns to its list).
export const NAV_RESELECT_EVENT = "nav:reselect";

interface NavLinksProps {
  // Called after a link is tapped, so the mobile menu can close itself.
  onNavigate?: () => void;

  // Mobile menu only: links fade and slide in one after another while
  // the menu opens. Left undefined, the links are always shown.
  revealed?: boolean;
}

// The menu list, shared by the desktop sidebar and the mobile top menu.
export function NavLinks({ onNavigate, revealed }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-2">
      {menuItems.map((item, index) => {
        const Icon = item.icon;

        const active = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={(event) => {
              if (active) {
                // Already here: no navigation, let the page reset itself.
                event.preventDefault();
                window.dispatchEvent(
                  new CustomEvent(NAV_RESELECT_EVENT, { detail: item.href })
                );
              }
              onNavigate?.();
            }}
            aria-current={active ? "page" : undefined}
            style={
              revealed === undefined
                ? undefined
                : { transitionDelay: revealed ? `${60 + index * 25}ms` : "0ms" }
            }
            className={`flex items-center gap-3 p-3 rounded-xl transition duration-300 ease-out active:scale-[0.98] ${
              active
                ? "bg-green-700"
                : "hover:bg-green-800"
            } ${
              revealed === false ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            <Icon size={20} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Desktop only; on smaller screens the Navbar hamburger shows the menu.
export default function Sidebar() {
  return (
    // Pinned to the viewport with its own scroll, so scrolling the page
    // does not move the menu and scrolling the menu does not move the page.
    <aside className="hidden lg:block w-72 shrink-0 sticky top-0 h-screen overflow-y-auto overscroll-contain bg-green-900 text-white">
      <div className="p-6 border-b border-green-700">
        <h1 className="text-xl font-bold">
          HydroNutri-IntelliSense
        </h1>

        <p className="text-sm text-green-200 mt-1">
          Smart Farm Management
        </p>
      </div>

      <NavLinks />
    </aside>
  );
}
