"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { mutate } from "swr";
import {
  ArrowLeft,
  Camera,
  Check,
  Crown,
  Users,
} from "lucide-react";
import { TeamCheckinModal } from "@/components/challenges/TeamCheckinModal";
import { useToast } from "@/components/ui/Toast";
import { formatPoints } from "@/lib/format";
import { ME_API_KEY } from "@/lib/me";
import { MOCK_USER } from "@/lib/mock-data";
import type {
  ApiResponse,
  TeamChallengeDetail,
  TeamCheckinResult,
} from "@/lib/types";

async function fetchDetail(url: string): Promise<TeamChallengeDetail> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<TeamChallengeDetail>;
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "챌린지를 불러오지 못했어요.");
  }
  return json.data;
}

export default function TeamChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id;
  const [checkinOpen, setCheckinOpen] = useState(false);

  const { data, isLoading, error, mutate: refresh } = useSWR(
    id ? `/api/challenges/team/${id}` : null,
    fetchDetail,
  );

  const handleCheckinSuccess = useCallback(
    (result: TeamCheckinResult) => {
      void refresh();
      void mutate(ME_API_KEY);
      showToast(`오늘 인증 완료! +50P (총 ${result.mileage.toLocaleString("ko-KR")}P)`);
    },
    [refresh, showToast],
  );

  if (isLoading || !data) {
    return (
      <div className="px-5 pb-4">
        <div className="skeleton mb-4 h-14 w-full rounded-xl" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-10 text-center text-[14px] text-text-secondary">
        챌린지를 찾을 수 없어요.
        <button
          type="button"
          className="mt-4 text-primary underline"
          onClick={() => router.replace("/challenges")}
        >
          목록으로
        </button>
      </div>
    );
  }

  const { challenge, participants, myRecord } = data;
  const myUserId = myRecord?.userId ?? MOCK_USER.id;
  const checkedInToday = challenge.checkedInToday ?? false;

  return (
    <>
      <div className="px-5 pb-8">
        <header className="flex h-14 items-center gap-3">
          <Link
            href="/challenges"
            aria-label="뒤로가기"
            className="flex h-11 w-11 items-center justify-center text-text-primary"
          >
            <ArrowLeft size={22} />
          </Link>
          <h1 className="line-clamp-1 flex-1 text-[18px] font-bold">
            {challenge.title}
          </h1>
        </header>

        <p className="text-[13px] font-medium text-primary">
          {challenge.company} · {challenge.teamName}
        </p>

        <div className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] text-text-secondary">팀 완료율</p>
              <p className="text-[32px] font-bold text-text-primary">
                {challenge.completionRate}%
              </p>
            </div>
            <p className="flex items-center gap-1 text-[13px] text-text-secondary">
              <Users size={14} aria-hidden />
              참여 {challenge.participants}명
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECECF2]">
            <div
              className="h-full rounded-full bg-[#3EC6A8] transition-all"
              style={{ width: `${challenge.completionRate}%` }}
            />
          </div>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-[18px] font-bold text-text-primary">
            참여자 순위
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            {participants.length === 0 ? (
              <li className="px-4 py-6 text-center text-[14px] text-text-secondary">
                아직 참여자가 없어요.
              </li>
            ) : (
              participants.map((p, index) => {
                const isMe = p.userId === myUserId;
                return (
                  <li
                    key={p.id}
                    className={`flex items-center gap-3 border-b border-[#F0F0F5] px-4 py-3.5 last:border-b-0 ${
                      isMe ? "bg-primary-light" : ""
                    }`}
                  >
                    {index === 0 ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        <Crown size={14} aria-hidden />
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECECF2] text-[13px] font-semibold text-text-secondary">
                        {index + 1}
                      </span>
                    )}
                    <span className="flex-1 text-[14px] font-semibold text-text-primary">
                      {p.nickname}
                      {isMe ? (
                        <span className="ml-1.5 text-[12px] font-medium text-primary">
                          나
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`min-w-[72px] text-right text-[14px] font-bold ${
                        index === 0 ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {formatPoints(p.pointsEarned)}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <h2 className="text-[16px] font-bold text-text-primary">내 기록</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F0F0F5] p-3">
              <p className="text-[12px] text-text-secondary">내 포인트</p>
              <p className="mt-1 text-[20px] font-bold text-text-primary">
                {formatPoints(myRecord?.pointsEarned ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-[#F0F0F5] p-3">
              <p className="text-[12px] text-text-secondary">연속 인증</p>
              <p className="mt-1 text-[20px] font-bold text-text-primary">
                {myRecord?.streakDays ?? 0}일
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={checkedInToday}
            onClick={() => setCheckinOpen(true)}
            className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold ${
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
        </section>
      </div>

      <TeamCheckinModal
        challenge={challenge}
        open={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        onSuccess={handleCheckinSuccess}
        onError={(msg) => showToast(msg, "error")}
      />
    </>
  );
}
