"use client";

import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { MOCK_STORE_ITEMS, MOCK_USER } from "@/lib/mock-data";
import { formatPoints } from "@/lib/format";
import type { StoreItem } from "@/lib/types";

export default function StorePage() {
  const { showToast } = useToast();
  const [mileage, setMileage] = useState(MOCK_USER.mileage ?? 2450);
  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const featured = MOCK_STORE_ITEMS.filter((i) => i.isFeatured);
  const all = MOCK_STORE_ITEMS.filter((i) => !i.isFeatured);
  const remaining = selected ? mileage - selected.price : 0;
  const canRedeem = selected !== null && remaining >= 0;

  async function handleRedeem() {
    if (!selected || !canRedeem || redeeming) return;
    setRedeeming(true);
    const prev = mileage;
    setMileage(remaining);
    setSelected(null);

    try {
      const res = await fetch("/api/store/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selected.id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "교환 실패");
      if (typeof json.data?.mileage === "number") {
        setMileage(json.data.mileage);
      }
      showToast("교환이 완료되었어요!");
    } catch {
      setMileage(prev);
      showToast("교환에 실패했어요.", "error");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <>
      <Header title="스토어" />
      <div className="space-y-6 px-5 pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary">
            리워드 스토어
          </h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            모은 마일리지로 건강 아이템을 교환하세요
          </p>
        </div>

        <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-white shadow-[var(--shadow-card)]">
          <p className="flex items-center gap-1.5 text-[13px] text-white/90">
            <Sparkles size={14} aria-hidden />
            내 BUDDI 마일리지
          </p>
          <p className="mt-2 text-[32px] font-bold tracking-tight">
            {mileage.toLocaleString("ko-KR")} P
          </p>
          <Gift
            size={56}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25"
            aria-hidden
          />
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
            추천 아이템
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {featured.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]"
              >
                <div className="relative flex aspect-square items-center justify-center bg-primary-light text-4xl">
                  {item.emoji}
                  {item.badge && (
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
                    {formatPoints(item.price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="mt-1 flex h-10 w-full items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-white"
                  >
                    포인트 교환
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
            전체 아이템
          </h2>
          <div className="space-y-3">
            {all.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)]"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-light text-2xl">
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-text-secondary">{item.brand}</p>
                  <h3 className="truncate text-[14px] font-semibold text-text-primary">
                    {item.name}
                  </h3>
                  <p className="text-[14px] font-bold text-primary">
                    {formatPoints(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="flex h-9 shrink-0 items-center rounded-full border border-primary px-3 text-[13px] font-semibold text-primary"
                >
                  교환
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(selected)}
        title="포인트 교환"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F0F0F5] p-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-2xl">
                {selected.emoji}
              </div>
              <div>
                <p className="text-[11px] text-text-secondary">
                  {selected.brand}
                </p>
                <p className="text-[14px] font-bold text-text-primary">
                  {selected.name}
                </p>
                <p className="text-[14px] font-bold text-primary">
                  {formatPoints(selected.price)}
                </p>
              </div>
            </div>
            <div className="mb-5 flex items-center justify-between rounded-full border border-[#E0E0EA] px-4 py-3">
              <span className="text-[13px] text-text-secondary">
                교환 후 잔액
              </span>
              <span
                className={`text-[15px] font-bold ${
                  remaining < 0 ? "text-[#E74C3C]" : "text-text-primary"
                }`}
              >
                {formatPoints(remaining)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-12 flex-1 items-center justify-center rounded-full border border-[#E0E0EA] text-[14px] font-semibold text-text-primary"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!canRedeem || redeeming}
                onClick={handleRedeem}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-primary text-[14px] font-semibold text-white disabled:opacity-40"
              >
                교환하기
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
