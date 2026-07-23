"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiResponse, PointHistoryResponse, PointLedgerEntry } from "@/lib/types";
import { formatPoints } from "@/lib/format";

async function fetchHistory(): Promise<PointHistoryResponse> {
  const res = await fetch("/api/points/history", { cache: "no-store" });
  const json = (await res.json()) as ApiResponse<PointHistoryResponse>;
  if (!res.ok || json.error || !json.data) {
    throw new Error(json.error ?? "불러오기 실패");
  }
  return json.data;
}

function formatLedgerDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LedgerRow({ entry }: { entry: PointLedgerEntry }) {
  const isEarn = entry.type === "적립";
  const sign = isEarn ? "+" : "-";

  return (
    <li className="flex items-start justify-between gap-3 border-b border-[#F0F0F5] px-4 py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-text-primary">
          {entry.reason}
        </p>
        <p className="mt-0.5 text-[12px] text-text-secondary">
          {formatLedgerDate(entry.createdAt)}
        </p>
      </div>
      <p
        className={`shrink-0 text-[15px] font-bold ${
          isEarn ? "text-success" : "text-[#E74C3C]"
        }`}
      >
        {sign}
        {entry.amount.toLocaleString("ko-KR")}P
      </p>
    </li>
  );
}

export default function PointHistoryPage() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/points/history",
    fetchHistory,
    { revalidateOnFocus: false },
  );

  return (
    <>
      <Header
        title="포인트 내역"
        leading={
          <Link
            href="/profile"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-primary"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={22} />
          </Link>
        }
      />

      <div className="space-y-4 px-5 pb-4">
        {isLoading ? (
          <div className="py-8 text-center text-[14px] text-text-secondary">
            불러오는 중…
          </div>
        ) : error ? (
          <EmptyState
            message={error.message ?? "포인트 내역을 불러오지 못했어요."}
            onRetry={() => void mutate()}
          />
        ) : (
          <>
            <section className="rounded-2xl bg-primary p-4 text-white shadow-[var(--shadow-card)]">
              <p className="text-[13px] text-white/90">현재 보유 포인트</p>
              <p className="mt-1 text-[28px] font-bold tracking-tight">
                {formatPoints(data?.balance ?? 0)}
              </p>
            </section>

            {data?.entries.length ? (
              <section>
                <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
                  {data.entries.map((entry) => (
                    <LedgerRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              </section>
            ) : (
              <EmptyState message="아직 포인트 내역이 없어요" />
            )}
          </>
        )}
      </div>
    </>
  );
}
