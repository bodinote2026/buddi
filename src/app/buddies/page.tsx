"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { MapPin, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { INTEREST_STYLES, MOCK_BUDDIES } from "@/lib/mock-data";
import { formatTemperature } from "@/lib/format";
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
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-primary-light">
          <Image
            src={buddy.avatarUrl}
            alt={`${buddy.name} 프로필 사진`}
            fill
            className="object-cover"
            unoptimized
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-text-primary">
                {buddy.name}{" "}
                <span className="font-medium text-text-secondary">
                  {buddy.age}
                </span>
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] text-text-secondary">
                <MapPin size={13} aria-hidden />
                {buddy.district} · {buddy.distanceKm}km
              </p>
              <p className="mt-1 text-[13px] text-text-primary">{buddy.intro}</p>
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

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(buddy.interests ?? []).map((interest) => {
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

      <Link
        href={`/chat/${buddy.id}`}
        className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-semibold text-white"
      >
        <MessageCircle size={16} aria-hidden />
        채팅 참여하기
      </Link>
    </article>
  );
}

export default function BuddiesPage() {
  const { data, error, isLoading, mutate } = useSWR(BUDDIES_KEY, fetchBuddies, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const buddies = data ?? (isLoading ? [] : MOCK_BUDDIES);

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
          <EmptyState message="주변에 버디가 없어요" />
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
