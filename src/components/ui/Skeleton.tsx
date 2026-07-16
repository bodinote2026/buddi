export function ChallengeCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function BuddyCardSkeleton() {
  return (
    <div className="w-[62vw] max-w-[210px] shrink-0 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-3.5 w-28 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="space-y-6 px-5 pt-2">
      <div className="space-y-2">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-7 w-56 rounded" />
      </div>
      <div className="space-y-3">
        <div className="skeleton h-5 w-36 rounded" />
        <ChallengeCardSkeleton />
        <ChallengeCardSkeleton />
        <ChallengeCardSkeleton />
      </div>
      <div className="space-y-3">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="-mx-5 flex gap-3 overflow-hidden px-5">
          <BuddyCardSkeleton />
          <BuddyCardSkeleton />
        </div>
      </div>
    </div>
  );
}
