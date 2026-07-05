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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-screen bg-green-900 text-white">
      <div className="p-6 border-b border-green-700">
        <h1 className="text-xl font-bold">
          HydroNutri-IntelliSense
        </h1>

        <p className="text-sm text-green-200 mt-1">
          Smart Farm Management
        </p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${
                active
                  ? "bg-green-700"
                  : "hover:bg-green-800"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}