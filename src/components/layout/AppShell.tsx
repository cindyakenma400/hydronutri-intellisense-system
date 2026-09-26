"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { isLoggedIn } from "@/services/authService";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const isLoginPage = pathname === "/login" || pathname === "/reset-password";

  useEffect(() => {
    const loggedIn = isLoggedIn();

    if (!loggedIn && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (loggedIn && isLoginPage) {
      router.replace("/dashboard");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [pathname, isLoginPage, router]);

  if (!ready) return null;

  // The login page has no sidebar or navbar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 overflow-x-clip">
          {/* Keyed by route so each page fades in as it opens. */}
          <div key={pathname} className="animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}