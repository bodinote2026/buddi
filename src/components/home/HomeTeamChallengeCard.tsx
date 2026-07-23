import Link from "next/link";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CircularProgress } from "@/components/ui/CircularProgress";
import type { TeamChallenge } from "@/lib/types";

interface HomeTeamChallengeCardProps {
  challenge: TeamChallenge;
}

export function HomeTeamChallengeCard({ challenge }: HomeTeamChallengeCardProps) {
  const showStreakBadge = challenge.myStreakDays !== undefined;

  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <Link
        href={`/challenges/team/${challenge.id}`}
        className="flex items-center gap-3"
      >
        <CircularProgress
          value={challenge.completionRate}
          size={56}
          strokeWidth={5}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-text-primary">
            <span className="mr-1" aria-hidden>
              🏆
            </span>
            {challenge.title}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-text-secondary">
            {challenge.company} · {challenge.teamName}
          </p>
          {showStreakBadge && (
            <Badge variant="success" className="mt-2 gap-1">
              <Flame size={12} aria-hidden />
              {challenge.myStreakDays}일 연속 달성
            </Badge>
          )}
        </div>
      </Link>
    </article>
  );
}
