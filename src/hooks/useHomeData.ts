"use client";

import useSWR from "swr";
import {
  MOCK_TEAM_CHALLENGES,
  MOCK_USER,
} from "@/lib/mock-data";
import type { ApiResponse, Buddy, TeamChallenge, User } from "@/lib/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || json.data === null) {
    throw new Error(json.error ?? "요청에 실패했습니다.");
  }
  return json.data;
}

export function useHomeData() {
  const me = useSWR<User>("/api/me", fetcher, {
    revalidateOnFocus: false,
  });
  const teamChallenges = useSWR<TeamChallenge[]>(
    "/api/challenges/team",
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const buddies = useSWR<Buddy[]>("/api/buddies?recommended=true", fetcher, {
    revalidateOnFocus: false,
  });

  const isLoading =
    me.isLoading || teamChallenges.isLoading || buddies.isLoading;
  const hasData = Boolean(
    me.data && teamChallenges.data && buddies.data,
  );
  const error =
    (!hasData &&
      (me.error?.message ||
        teamChallenges.error?.message ||
        buddies.error?.message)) ||
    null;

  return {
    user: me.data ?? (!isLoading ? MOCK_USER : undefined),
    teamChallenges:
      teamChallenges.data ?? (!isLoading ? MOCK_TEAM_CHALLENGES : []),
    buddies: buddies.data ?? [],
    isLoading: isLoading && !hasData,
    error,
    retry: () => {
      void me.mutate();
      void teamChallenges.mutate();
      void buddies.mutate();
    },
  };
}
