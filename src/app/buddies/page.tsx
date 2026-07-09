"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { BuddyCard } from "@/components/home/BuddyCard";
import { Chip } from "@/components/ui/Chip";
import { BUDDY_FILTERS, MOCK_BUDDIES } from "@/lib/mock-data";

type SortMode = "거리" | "온도";

export default function BuddiesPage() {
  const [filter, setFilter] = useState<string>("전체");
  const [sort, setSort] = useState<SortMode>("온도");

  const buddies = useMemo(() => {
    const filtered =
      filter === "전체"
        ? MOCK_BUDDIES
        : MOCK_BUDDIES.filter((b) => b.category.includes(filter));

    return [...filtered].sort((a, b) =>
      sort === "거리"
        ? a.distanceKm - b.distanceKm
        : b.temperature - a.temperature,
    );
  }, [filter, sort]);

  return (
    <>
      <Header title="버디" />
      <div className="space-y-4 px-5 pb-4">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {BUDDY_FILTERS.map((item) => (
            <Chip
              key={item}
              label={item}
              active={filter === item}
              onClick={() => setFilter(item)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {(["거리", "온도"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              className={`flex h-9 items-center rounded-full px-3 text-[12px] font-medium transition-colors ${
                sort === mode
                  ? "bg-primary-light text-primary"
                  : "bg-surface text-text-secondary shadow-[var(--shadow-card)]"
              }`}
            >
              {mode} 정렬
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {buddies.map((buddy) => (
            <BuddyCard key={buddy.id} buddy={buddy} compact />
          ))}
        </div>
      </div>
    </>
  );
}
