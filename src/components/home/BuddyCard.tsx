import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { formatTemperature } from "@/lib/format";
import type { Buddy } from "@/lib/types";

interface BuddyCardProps {
  buddy: Buddy;
  compact?: boolean;
  priority?: boolean;
}

export function BuddyCard({
  buddy,
  compact = false,
  priority = false,
}: BuddyCardProps) {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)] ${
        compact ? "w-full" : "w-[73vw] shrink-0 snap-start"
      }`}
    >
      <div className="relative aspect-[4/3] bg-primary-light">
        <Image
          src={buddy.avatarUrl}
          alt={`${buddy.name} 프로필 사진`}
          fill
          className="object-cover"
          unoptimized
          sizes={compact ? "80px" : "73vw"}
          priority={priority}
        />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-text-primary shadow-sm">
          {formatTemperature(buddy.temperature)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[12px] font-medium text-primary">{buddy.category}</p>
        <h3 className="text-[15px] font-semibold text-text-primary">
          {buddy.name} · {buddy.age}
        </h3>
        <p className="flex items-center gap-1 text-[13px] text-text-secondary">
          <MapPin size={14} aria-hidden />
          {buddy.distanceKm}km
        </p>
        <Link
          href={`/chat/${buddy.id}`}
          className="mt-auto flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <MessageCircle size={16} aria-hidden />
          채팅하기
        </Link>
      </div>
    </article>
  );
}
