"use client";

import Link from "next/link";
import useSWR from "swr";
import { Gift, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StoreItemThumbnail } from "@/components/store/StoreItemThumbnail";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_STORE_ITEMS, MOCK_USER } from "@/lib/mock-data";
import { formatCurrency, formatPoints } from "@/lib/format";
import type { ApiResponse, StoreItem, User } from "@/lib/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || json.error || json.data === null) {
    throw new Error(json.error ?? "불러오기 실패");
  }
  return json.data;
}

function StoreItemCard({
  item,
  variant,
}: {
  item: StoreItem;
  variant: "featured" | "list";
}) {
  const soldOut = item.stock <= 0;

  if (variant === "featured") {
    return (
      <Link
        href={`/store/${item.id}`}
        className="block overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]"
      >
        <div className="relative">
          <StoreItemThumbnail
            item={item}
            size="lg"
            className="aspect-square w-full rounded-none"
          />
          {soldOut && (
            <span className="absolute left-2 top-2 rounded-full bg-[#333] px-2 py-0.5 text-[11px] font-semibold text-white">
              품절
            </span>
          )}
          {item.badge && !soldOut && (
            <span className="absolute left-2 top-2 rounded-full bg-[#E8F5EE] px-2 py-0.5 text-[11px] font-semibold text-success">
              {item.badge}
            </span>
          )}
        </div>
        <div className="space-y-1 p-3">
          <p className="text-[11px] text-text-secondary">{item.brand}</p>
          <h3 className="line-clamp-2 text-[13px] font-semibold text-text-primary">
            {item.name}
          </h3>
          <p className="text-[14px] font-bold text-primary">
            {formatCurrency(item.price)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/store/${item.id}`}
      className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)]"
    >
      <StoreItemThumbnail item={item} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-text-secondary">{item.brand}</p>
        <h3 className="truncate text-[14px] font-semibold text-text-primary">
          {item.name}
        </h3>
        <p className="text-[14px] font-bold text-primary">
          {formatCurrency(item.price)}
        </p>
      </div>
      {soldOut ? (
        <span className="shrink-0 rounded-full bg-[#ECECF2] px-3 py-1 text-[12px] font-semibold text-text-secondary">
          품절
        </span>
      ) : (
        <span className="shrink-0 text-[13px] font-semibold text-primary">
          보기
        </span>
      )}
    </Link>
  );
}

export default function StorePage() {
  const {
    data: items = MOCK_STORE_ITEMS,
    error,
    isLoading,
    mutate,
  } = useSWR<StoreItem[]>("/api/store/items", fetchJson, {
    revalidateOnFocus: false,
  });
  const { data: user } = useSWR<User>("/api/me", fetchJson, {
    revalidateOnFocus: false,
  });

  const mileage = user?.mileage ?? MOCK_USER.mileage ?? 0;
  const featured = items.filter((i) => i.isFeatured);
  const all = items.filter((i) => !i.isFeatured);

  return (
    <>
      <Header title="스토어" />
      {isLoading ? (
        <div className="px-5 py-8 text-center text-[14px] text-text-secondary">
          불러오는 중…
        </div>
      ) : error ? (
        <div className="px-5 pt-4">
          <EmptyState
            message={error.message ?? "스토어를 불러오지 못했어요."}
            onRetry={() => void mutate()}
          />
        </div>
      ) : (
        <div className="space-y-6 px-5 pb-4">
          <div>
            <h2 className="text-[20px] font-bold text-text-primary">
              리워드 스토어
            </h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              포인트와 함께 건강 아이템을 구매하세요
            </p>
          </div>

          <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-white shadow-[var(--shadow-card)]">
            <p className="flex items-center gap-1.5 text-[13px] text-white/90">
              <Sparkles size={14} aria-hidden />
              내 BUDDI 포인트
            </p>
            <p className="mt-2 text-[32px] font-bold tracking-tight">
              {formatPoints(mileage)}
            </p>
            <Gift
              size={56}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25"
              aria-hidden
            />
          </section>

          {featured.length > 0 && (
            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
                추천 아이템
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {featured.map((item) => (
                  <StoreItemCard key={item.id} item={item} variant="featured" />
                ))}
              </div>
            </section>
          )}

          {all.length > 0 && (
            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
                전체 아이템
              </h2>
              <div className="space-y-3">
                {all.map((item) => (
                  <StoreItemCard key={item.id} item={item} variant="list" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
