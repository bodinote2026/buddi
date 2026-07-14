"use client";

import { SessionProvider } from "next-auth/react";
import { OnboardingGuard } from "@/components/auth/OnboardingGuard";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <OnboardingGuard>{children}</OnboardingGuard>
      </ToastProvider>
    </SessionProvider>
  );
}
