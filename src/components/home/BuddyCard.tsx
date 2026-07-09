import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
        compact ? "w-full" : "w-[72vw] max-w-[260px] shrink-0 snap-start"
      }`}
    >
      <div className="relative aspect-[4/3] bg-primary-light">
        <Image
          src={buddy.avatarUrl}
          alt={`${buddy.name} 프로필 사진`}
          fill
          className="object-cover"
          unoptimized
          sizes="260px"
          priority={priority}
        />
        <Badge
          variant="primary"
          className="absolute right-2.5 top-2.5 bg-primary text-[11px] font-bold text-white"
        >
          {buddy.temperature}°
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Badge variant="primary" className="w-fit">
          {buddy.category}
        </Badge>
        <h3 className="text-[15px] font-semibold text-text-primary">
          {buddy.name} · {buddy.age}
        </h3>
        <p className="flex items-center gap-1 text-[13px] text-text-secondary">
          <MapPin size={14} aria-hidden />
          {buddy.distanceKm}km
        </p>
        <Link
          href={`/chat/${buddy.id}`}
          className="mt-auto flex h-11 w-full items-center justify-center rounded-full bg-primary text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          채팅하기
        </Link>
      </div>
    </article>
  );
}
