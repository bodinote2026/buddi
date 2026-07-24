"use client";

import useSWR from "swr";
import { Header } from "@/components/layout/Header";
import { BuddyChatButton } from "@/components/buddies/BuddyChatButton";
import { BuddyEmptyState } from "@/components/buddies/BuddyEmptyState";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { INTEREST_STYLES } from "@/lib/mock-data";
import { formatTemperature } from "@/lib/format";
import { formatBuddyName, formatBuddyOrg } from "@/lib/buddy-display";
import type { ApiResponse, Buddy } from "@/lib/types";

const BUDDIES_KEY = "/api/buddies";

async function fetchBuddies(): Promise<Buddy[]> {
  const res = await fetch(BUDDIES_KEY, { cache: "no-store" });
  const json = (await res.json()) as ApiResponse<Buddy[]>;
  if (!res.ok || json.error || !json.data) {
    throw new Error(json.error ?? "불러오기 실패");
  }
  return json.data;
}

function BuddyListItem({ buddy }: { buddy: Buddy }) {
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0">
          <UserAvatar
            src={buddy.avatarUrl}
            alt={`${buddy.name} 프로필 사진`}
            shape="circle"
            className="h-20 w-20"
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[12px] font-medium text-primary">
                {formatBuddyOrg(buddy)}
              </p>
              <h3 className="mt-0.5 text-[16px] font-bold text-text-primary">
                {formatBuddyName(buddy)}
              </h3>
              {buddy.intro && (
                <p className="mt-1 text-[13px] text-text-primary">
                  {buddy.intro}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[20px] font-bold text-text-primary">
                {formatTemperature(buddy.temperature)}
              </p>
              <p className="text-[11px] text-text-secondary">버디 온도</p>
            </div>
          </div>
        </div>
      </div>

      {(buddy.interests?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {buddy.interests!.map((interest) => {
            const style = INTEREST_STYLES[interest] ?? {
              emoji: "✨",
              className: "bg-[#F0F0F5] text-text-secondary",
            };
            return (
              <span
                key={interest}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${style.className}`}
              >
                {style.emoji} {interest}
              </span>
            );
          })}
        </div>
      )}

      <BuddyChatButton
        label="채팅 참여하기"
        className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-semibold text-white"
      />
    </article>
  );
}

export default function BuddiesPage() {
  const { data, error, isLoading, mutate } = useSWR(BUDDIES_KEY, fetchBuddies, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const buddies = data ?? [];

  return (
    <>
      <Header title="버디" />
      <div className="space-y-4 px-5 pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary">버디 찾기</h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            내 주변의 건강한 친구를 만나보세요
          </p>
        </div>

        {isLoading && !data ? (
          <p className="py-8 text-center text-[14px] text-text-secondary">
            불러오는 중…
          </p>
        ) : error ? (
          <EmptyState
            message={error.message}
            onRetry={() => void mutate()}
          />
        ) : buddies.length === 0 ? (
          <BuddyEmptyState variant="page" />
        ) : (
          <div className="space-y-3">
            {buddies.map((buddy) => (
              <BuddyListItem key={buddy.id} buddy={buddy} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
