import Link from "next/link";
import { Camera, Flame } from "lucide-react";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Badge } from "@/components/ui/Badge";
import type { Challenge } from "@/lib/types";

interface ChallengeCardProps {
  challenge: Challenge;
  showCheckin?: boolean;
  onCheckin?: (id: string) => void;
}

export function ChallengeCard({
  challenge,
  showCheckin = false,
  onCheckin,
}: ChallengeCardProps) {
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <Link
        href={`/challenges/${challenge.id}`}
        className="flex items-center gap-3"
      >
        <CircularProgress value={challenge.progress} size={56} strokeWidth={5} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-text-primary">
            <span className="mr-1" aria-hidden>
              {challenge.emoji}
            </span>
            {challenge.title}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-text-secondary">
            {challenge.description}
          </p>
          <Badge variant="success" className="mt-2 gap-1">
            <Flame size={12} aria-hidden />
            {challenge.streakDays}일 연속 달성
          </Badge>
        </div>
      </Link>

      {showCheckin && (
        <button
          type="button"
          onClick={() => onCheckin?.(challenge.id)}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary text-[14px] font-semibold text-primary transition-colors hover:bg-primary-light"
        >
          <Camera size={18} aria-hidden />
          오늘 인증하기
        </button>
      )}
    </article>
  );
}
