import Link from "next/link";
import { BuddyEmptyState } from "@/components/buddies/BuddyEmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BuddyCard } from "./BuddyCard";
import type { Buddy } from "@/lib/types";

interface BuddyCarouselProps {
  buddies: Buddy[];
}

export function BuddyCarousel({ buddies }: BuddyCarouselProps) {
  return (
    <section aria-label="오프라인 버디 추천" className="px-5">
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
      {buddies.length === 0 ? (
        <BuddyEmptyState variant="home" />
      ) : (
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {buddies.map((buddy, index) => (
            <BuddyCard
              key={buddy.id}
              buddy={buddy}
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
