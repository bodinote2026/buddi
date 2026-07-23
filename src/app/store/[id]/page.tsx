"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PurchaseModal } from "@/components/store/PurchaseModal";
import { StoreItemThumbnail } from "@/components/store/StoreItemThumbnail";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_USER } from "@/lib/mock-data";
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

export default function StoreItemDetailPage() {
  const params = useParams<{ id: string }>();
  const itemId = params.id;
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseSession, setPurchaseSession] = useState(0);

  const { data: item, error, isLoading, mutate } = useSWR(
    itemId ? `/api/store/items/${itemId}` : null,
    fetchJson<StoreItem>,
  );
  const { data: user } = useSWR<User>("/api/me", fetchJson, {
    revalidateOnFocus: false,
  });

  const mileage = user?.mileage ?? MOCK_USER.mileage ?? 0;
  const soldOut = item ? item.stock <= 0 : false;

  return (
    <>
      <Header
        title="상품 상세"
        leading={
          <Link
            href="/store"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-primary"
            aria-label="스토어로 돌아가기"
          >
            <ArrowLeft size={22} />
          </Link>
        }
      />

      {isLoading ? (
        <div className="px-5 py-8 text-center text-[14px] text-text-secondary">
          불러오는 중…
        </div>
      ) : error || !item ? (
        <div className="px-5 pt-4">
          <EmptyState
            message={error?.message ?? "상품을 찾을 수 없습니다."}
            onRetry={() => void mutate()}
          />
        </div>
      ) : (
        <div className="space-y-6 px-5 pb-28">
          <div className="relative overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            <StoreItemThumbnail item={item} size="lg" className="rounded-none" />
            {soldOut && (
              <span className="absolute left-3 top-3 rounded-full bg-[#333] px-3 py-1 text-[12px] font-semibold text-white">
                품절
              </span>
            )}
            {item.badge && !soldOut && (
              <span className="absolute left-3 top-3 rounded-full bg-[#E8F5EE] px-2 py-0.5 text-[11px] font-semibold text-success">
                {item.badge}
              </span>
            )}
          </div>

          <section className="space-y-2">
            <p className="text-[13px] font-medium text-primary">{item.brand}</p>
            <h1 className="text-[22px] font-bold text-text-primary">{item.name}</h1>
            <p className="text-[24px] font-bold text-primary">
              {formatCurrency(item.price)}
            </p>
            {!soldOut && item.stock > 0 && item.stock <= 10 && (
              <p className="text-[12px] text-[#E74C3C]">
                재고 {item.stock}개 남음
              </p>
            )}
          </section>

          {item.description && (
            <section>
              <h2 className="mb-2 text-[15px] font-semibold text-text-primary">
                상품 설명
              </h2>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">
                {item.description}
              </p>
            </section>
          )}

          <section className="rounded-2xl bg-primary p-4 text-white">
            <p className="flex items-center gap-1.5 text-[13px] text-white/90">
              <Sparkles size={14} aria-hidden />
              사용 가능 포인트
            </p>
            <p className="mt-1 text-[22px] font-bold">{formatPoints(mileage)}</p>
            <p className="mt-1 text-[12px] text-white/80">
              상품가의 최대 40%까지 포인트로 결제할 수 있어요.
            </p>
          </section>
        </div>
      )}

      {item && (
        <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-[#ECECF2] bg-background px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              setPurchaseSession((s) => s + 1);
              setPurchaseOpen(true);
            }}
            className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#ECECF2] disabled:text-text-secondary"
          >
            {soldOut ? "품절" : "구매하기"}
          </button>
        </div>
      )}

      <PurchaseModal
        key={purchaseSession}
        item={item ?? null}
        open={purchaseOpen}
        userPoints={mileage}
        onClose={() => setPurchaseOpen(false)}
      />
    </>
  );
}
