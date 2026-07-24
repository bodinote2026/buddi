import { Users } from "lucide-react";

interface BuddyEmptyStateProps {
  variant?: "home" | "page";
}

export function BuddyEmptyState({ variant = "page" }: BuddyEmptyStateProps) {
  if (variant === "home") {
    return (
      <article
        aria-label="추천 버디 없음"
        className="flex w-[62vw] max-w-[210px] flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]"
      >
        <div className="flex aspect-square flex-col items-center justify-center bg-primary-light px-4 text-center">
          <p className="text-[13px] font-medium text-text-secondary">
            추천할 버디가 없어요
          </p>
        </div>
        <div className="p-3">
          <div className="h-[84px]" aria-hidden />
        </div>
      </article>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-surface px-5 py-16 text-center shadow-[var(--shadow-card)]">
      <Users
        size={40}
        strokeWidth={1.5}
        className="mb-3 text-[#C8C8D4]"
        aria-hidden
      />
      <p className="text-[15px] font-medium text-text-primary">
        아직 추천할 버디가 없어요
      </p>
      <p className="mt-1 text-[13px] text-text-secondary">
        곧 새로운 버디를 만나보실 수 있어요
      </p>
    </div>
  );
}
