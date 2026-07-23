import Link from "next/link";
import { HomeTeamChallengeCard } from "@/components/home/HomeTeamChallengeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { TeamChallenge } from "@/lib/types";

const HOME_CHALLENGE_LIMIT = 2;

interface ChallengeListProps {
  challenges: TeamChallenge[];
}

export function ChallengeList({ challenges }: ChallengeListProps) {
  const displayed = challenges.slice(0, HOME_CHALLENGE_LIMIT);

  return (
    <section aria-label="진행 중인 챌린지" className="px-5">
      <SectionHeader
        title="진행 중인 챌린지"
        action={
          <Link
            href="/challenges"
            className="text-[13px] font-medium text-primary"
          >
            더보기 &gt;
          </Link>
        }
      />

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface px-5 py-10 text-center shadow-[var(--shadow-card)]">
          <p className="text-[14px] text-text-secondary">
            아직 참여 중인 챌린지가 없어요
          </p>
          <Link
            href="/challenges"
            className="flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[14px] font-semibold text-white"
          >
            챌린지 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((challenge) => (
            <HomeTeamChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </section>
  );
}
