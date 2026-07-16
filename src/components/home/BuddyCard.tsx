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
        compact ? "w-full" : "w-[62vw] max-w-[210px] shrink-0 snap-start"
      }`}
    >
      <div className="relative aspect-square bg-primary-light">
        <Image
          src={buddy.avatarUrl}
          alt={`${buddy.name} 프로필 사진`}
          fill
          className="object-cover"
          unoptimized
          sizes="(max-width: 390px) 62vw, 210px"
          priority={priority}
        />
        <span className="absolute right-2 top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-text-primary shadow-sm">
          {formatTemperature(buddy.temperature)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] font-medium text-primary">{buddy.category}</p>
        <h3 className="text-[13px] font-semibold text-text-primary">
          {buddy.name} · {buddy.age}
        </h3>
        <p className="flex items-center gap-1 text-[12px] text-text-secondary">
          <MapPin size={12} aria-hidden />
          {buddy.distanceKm}km
        </p>
        <Link
          href={`/chat/${buddy.id}`}
          className="mt-auto flex h-9 w-full items-center justify-center gap-1 rounded-full bg-primary text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <MessageCircle size={14} aria-hidden />
          채팅하기
        </Link>
      </div>
    </article>
  );
}
