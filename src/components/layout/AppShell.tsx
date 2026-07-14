"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "./BottomTabBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideChrome = pathname === "/onboarding";

  return (
    <div className="min-h-dvh bg-[#EDEDF2]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-[0_0_40px_rgba(0,0,0,0.06)]">
        <main
          className={`flex-1 overflow-y-auto ${hideChrome ? "" : "pb-20"}`}
        >
          {children}
        </main>
        {!hideChrome && <BottomTabBar />}
      </div>
    </div>
  );
}
