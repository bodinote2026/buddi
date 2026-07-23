"use client";

import { Header } from "@/components/layout/Header";
import { GreetingSection } from "@/components/home/GreetingSection";
import { ChallengeList } from "@/components/home/ChallengeList";
import { BuddyCarousel } from "@/components/home/BuddyCarousel";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHomeData } from "@/hooks/useHomeData";

export function HomePage() {
  const { user, teamChallenges, buddies, isLoading, error, retry } =
    useHomeData();

  return (
    <>
      <Header showLogo />
      {isLoading ? (
        <HomeSkeleton />
      ) : error || !user ? (
        <div className="px-5 pt-4">
          <EmptyState
            message={error ?? "데이터를 불러오지 못했어요."}
            onRetry={retry}
          />
        </div>
      ) : (
        <div className="space-y-6 pb-4">
          <GreetingSection user={user} />
          <ChallengeList challenges={teamChallenges} />
          <BuddyCarousel buddies={buddies} />
        </div>
      )}
    </>
  );
}
