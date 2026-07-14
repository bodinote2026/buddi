"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { needsOnboarding } from "@/lib/format";
import type { ApiResponse, User } from "@/lib/types";

async function fetcher(url: string): Promise<User> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<User>;
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "failed");
  }
  return json.data;
}

/**
 * Redirects authenticated users with incomplete Company/Team to /onboarding.
 * Guests are never redirected (demo browsing remains free).
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const onOnboarding = pathname === "/onboarding";

  const { data: me } = useSWR(
    status === "authenticated" ? "/api/me" : null,
    fetcher,
    { revalidateOnFocus: true },
  );

  useEffect(() => {
    if (status !== "authenticated" || !me) return;

    if (needsOnboarding(me) && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }

    if (!needsOnboarding(me) && onOnboarding) {
      router.replace("/");
    }
  }, [status, me, onOnboarding, router]);

  return <>{children}</>;
}
