import Link from "next/link";
import { Camera, Check, Users } from "lucide-react";
import { PARTICIPATION_DENIED_MESSAGE } from "@/lib/challenge-eligibility";
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
  const canParticipate = challenge.canParticipate ?? false;
  const checkedInToday = challenge.checkedInToday ?? false;
  const viewOnly = showCheckin && !canParticipate;

  return (
    <article
      className={`relative rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] ${
        viewOnly ? "opacity-70" : ""
      }`}
    >
      <Link href={`/challenges/team/${challenge.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-medium text-primary">
            {challenge.company} · {challenge.teamName}
          </p>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {viewOnly ? (
              <span className="rounded-full bg-[#ECECF2] px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                열람만 가능
              </span>
            ) : null}
            <span className="text-[22px] font-bold text-text-primary">
              {challenge.completionRate}%
            </span>
          </div>
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
        <>
          {viewOnly ? (
            <>
              <button
                type="button"
                disabled
                className="mt-3 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[#E0E0E8] bg-[#F8F8FB] text-[14px] font-semibold text-text-secondary opacity-60"
              >
                <Camera size={18} aria-hidden />
                오늘 인증하기
              </button>
              <p className="mt-2 text-center text-[12px] text-text-secondary">
                {PARTICIPATION_DENIED_MESSAGE}
              </p>
            </>
          ) : (
            <button
              type="button"
              disabled={checkedInToday}
              onClick={() => onCheckin?.(challenge)}
              className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors ${
                checkedInToday
                  ? "bg-[#E8F5EE] text-success"
                  : "border border-primary bg-white text-primary hover:bg-primary-light"
              }`}
            >
              {checkedInToday ? (
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
        </>
      )}
    </article>
  );
}
