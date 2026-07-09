import { SectionHeader } from "@/components/ui/SectionHeader";
import { ChallengeCard } from "./ChallengeCard";
import type { Challenge } from "@/lib/types";

interface ChallengeListProps {
  challenges: Challenge[];
  showCheckin?: boolean;
  onCheckin?: (id: string) => void;
}

export function ChallengeList({
  challenges,
  showCheckin = false,
  onCheckin,
}: ChallengeListProps) {
  return (
    <section aria-label="진행 중인 챌린지" className="px-5">
      <SectionHeader
        title="진행 중인 챌린지"
        action={
          <span className="text-[13px] text-text-secondary">
            {challenges.length}개 진행 중
          </span>
        }
      />
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            showCheckin={showCheckin}
            onCheckin={onCheckin}
          />
        ))}
      </div>
    </section>
  );
}
