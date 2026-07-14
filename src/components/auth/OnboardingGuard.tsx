"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { needsOnboarding } from "@/lib/format";
import { fetchMe, ME_API_KEY } from "@/lib/me";

/**
 * Redirects authenticated users with incomplete Company/Team to /onboarding.
 * Always uses replace() so history does not stack onboarding entries.
 * Guests are never redirected (demo browsing remains free).
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const onOnboarding = pathname === "/onboarding";

  const { data: me } = useSWR(
    status === "authenticated" ? ME_API_KEY : null,
    fetchMe,
    {
      // Prefer cache written by onboarding submit; avoid focus refetch
      // immediately wiping company/team and bouncing back to /onboarding.
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
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
