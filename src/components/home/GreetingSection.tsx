import { Timer } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { User } from "@/lib/types";

interface GreetingSectionProps {
  user: User;
}

export function GreetingSection({ user }: GreetingSectionProps) {
  return (
    <section className="flex items-start justify-between gap-3 px-5 pt-1">
      <div className="min-w-0">
        <p className="text-[14px] text-text-secondary">안녕하세요 👋</p>
        <h1 className="mt-1 text-[22px] font-bold leading-snug text-text-primary">
          {user.displayName}님, 오늘도 함께해요
        </h1>
      </div>
      <Badge
        variant="primary"
        className="mt-1 shrink-0 gap-1 whitespace-nowrap"
      >
        <Timer size={12} aria-hidden />
        {user.totalStreakDays}일 연속
      </Badge>
    </section>
  );
}
