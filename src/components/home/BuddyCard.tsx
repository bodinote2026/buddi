"use client";

import { formatTemperature } from "@/lib/format";
import { formatBuddyName, formatBuddyOrg } from "@/lib/buddy-display";
import { BuddyChatButton } from "@/components/buddies/BuddyChatButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
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
        <UserAvatar
          src={buddy.avatarUrl}
          alt={`${buddy.name} 프로필 사진`}
          shape="square"
          fill
          sizes="(max-width: 390px) 62vw, 210px"
          priority={priority}
        />
        <span className="absolute right-2 top-2 z-10 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-text-primary shadow-sm">
          {formatTemperature(buddy.temperature)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] font-medium text-primary">
          {formatBuddyOrg(buddy)}
        </p>
        <h3 className="text-[13px] font-semibold text-text-primary">
          {formatBuddyName(buddy)}
        </h3>
        {buddy.intro && (
          <p className="line-clamp-2 text-[12px] text-text-secondary">
            {buddy.intro}
          </p>
        )}
        <BuddyChatButton />
      </div>
    </article>
  );
}
