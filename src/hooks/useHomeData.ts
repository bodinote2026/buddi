"use client";

import useSWR from "swr";
import {
  MOCK_BUDDIES,
  MOCK_CHALLENGES,
  MOCK_USER,
} from "@/lib/mock-data";
import type { ApiResponse, Buddy, Challenge, User } from "@/lib/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
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
  const challenges = useSWR<Challenge[]>("/api/challenges/my", fetcher, {
    revalidateOnFocus: false,
  });
  const buddies = useSWR<Buddy[]>("/api/buddies?recommended=true", fetcher, {
    revalidateOnFocus: false,
  });

  const isLoading = me.isLoading || challenges.isLoading || buddies.isLoading;
  const hasData = Boolean(me.data && challenges.data && buddies.data);
  const error =
    (!hasData &&
      (me.error?.message ||
        challenges.error?.message ||
        buddies.error?.message)) ||
    null;

  return {
    user: me.data ?? (!isLoading ? MOCK_USER : undefined),
    challenges: challenges.data ?? (!isLoading ? MOCK_CHALLENGES : []),
    buddies: buddies.data ?? (!isLoading ? MOCK_BUDDIES : []),
    isLoading: isLoading && !hasData,
    error,
    retry: () => {
      void me.mutate();
      void challenges.mutate();
      void buddies.mutate();
    },
  };
}
