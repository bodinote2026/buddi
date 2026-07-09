import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BuddyCard } from "./BuddyCard";
import type { Buddy } from "@/lib/types";

interface BuddyCarouselProps {
  buddies: Buddy[];
}

export function BuddyCarousel({ buddies }: BuddyCarouselProps) {
  return (
    <section aria-label="오프라인 버디 추천">
      <div className="px-5">
        <SectionHeader
          title="오프라인 버디 추천"
          action={
            <Link
              href="/buddies"
              className="text-[13px] font-medium text-primary"
            >
              더보기
            </Link>
          }
        />
      </div>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {buddies.map((buddy, index) => (
          <BuddyCard
            key={buddy.id}
            buddy={buddy}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
