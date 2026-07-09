"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ChallengeCard } from "@/components/home/ChallengeCard";
import { Chip } from "@/components/ui/Chip";
import {
  CHALLENGE_CATEGORIES,
  MOCK_CHALLENGES,
  MOCK_EXPLORE_CHALLENGES,
} from "@/lib/mock-data";
import type { Challenge } from "@/lib/types";

type Segment = "진행 중" | "탐색" | "완료";

export default function ChallengesPage() {
  const [segment, setSegment] = useState<Segment>("진행 중");
  const [category, setCategory] = useState<string>("전체");
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [toast, setToast] = useState<string | null>(null);

  const explore =
    category === "전체"
      ? MOCK_EXPLORE_CHALLENGES
      : MOCK_EXPLORE_CHALLENGES.filter((c) => c.category === category);

  async function handleCheckin(id: string) {
    const prev = challenges;
    setChallenges((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              progress: Math.min(100, c.progress + 5),
              streakDays: c.streakDays + 1,
            }
          : c,
      ),
    );
    setToast("오늘 인증 완료!");

    try {
      const res = await fetch(`/api/challenges/${id}/checkin`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "인증 실패");
      if (json.data) {
        setChallenges((list) =>
          list.map((c) => (c.id === id ? json.data : c)),
        );
      }
    } catch {
      setChallenges(prev);
      setToast("인증에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setTimeout(() => setToast(null), 2200);
    }
  }

  return (
    <>
      <Header title="챌린지" />
      <div className="space-y-5 px-5 pb-4">
        <div className="flex gap-2 rounded-full bg-[#ECECF2] p-1">
          {(["진행 중", "탐색", "완료"] as Segment[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSegment(item)}
              className={`flex h-10 flex-1 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                segment === item
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-secondary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {segment === "진행 중" && (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                showCheckin
                onCheckin={handleCheckin}
              />
            ))}
          </div>
        )}

        {segment === "탐색" && (
          <div className="space-y-4">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {CHALLENGE_CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </div>
            <div className="space-y-3">
              {explore.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-xl">
                    {item.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex h-11 shrink-0 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-white"
                  >
                    참여하기
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {segment === "완료" && (
          <div className="rounded-2xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-card)]">
            <p className="text-[14px] text-text-secondary">
              완료한 챌린지가 아직 없어요.
            </p>
          </div>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-text-primary px-4 py-2.5 text-[13px] text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
