import Link from "next/link";
import { Camera, Check, Users } from "lucide-react";
import type { TeamChallenge } from "@/lib/types";

interface TeamChallengeCardProps {
  challenge: TeamChallenge;
  showCheckin?: boolean;
  onCheckin?: (challenge: TeamChallenge) => void;
}

export function TeamChallengeCard({
  challenge,
  showCheckin = false,
  onCheckin,
}: TeamChallengeCardProps) {
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <Link href={`/challenges/team/${challenge.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-medium text-primary">
            {challenge.company} · {challenge.teamName}
          </p>
          <span className="text-[22px] font-bold text-text-primary">
            {challenge.completionRate}%
          </span>
        </div>
        <h3 className="mt-1 text-[16px] font-bold text-text-primary">
          {challenge.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-text-secondary">
          <Users size={14} aria-hidden />
          참여 {challenge.participants}명
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECECF2]">
          <div
            className="h-full rounded-full bg-[#3EC6A8] transition-all duration-500"
            style={{ width: `${challenge.completionRate}%` }}
          />
        </div>
        <p className="mt-1 text-[12px] text-text-secondary">
          팀 완료율 · 탭하여 상세 보기
        </p>
      </Link>

      {showCheckin && (
        <button
          type="button"
          disabled={challenge.checkedInToday}
          onClick={() => onCheckin?.(challenge)}
          className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors ${
            challenge.checkedInToday
              ? "bg-[#E8F5EE] text-success"
              : "border border-primary bg-white text-primary hover:bg-primary-light"
          }`}
        >
          {challenge.checkedInToday ? (
            <>
              <Check size={18} aria-hidden />
              인증 완료
            </>
          ) : (
            <>
              <Camera size={18} aria-hidden />
              오늘 인증하기
            </>
          )}
        </button>
      )}
    </article>
  );
}
