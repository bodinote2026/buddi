import Image from "next/image";
import { ChevronRight, Settings, Flame, Trophy, Heart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { MOCK_CHALLENGES, MOCK_USER } from "@/lib/mock-data";

const SETTINGS = [
  { label: "알림 설정", icon: Settings },
  { label: "관심 카테고리", icon: Heart },
  { label: "참여 챌린지 히스토리", icon: Trophy },
] as const;

function StreakCalendar() {
  const days = Array.from({ length: 35 }, (_, i) => {
    const active = i % 3 !== 0 && i < 28;
    const intensity = active ? ((i % 4) + 1) / 4 : 0;
    return { id: i, intensity };
  });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day) => (
        <div
          key={day.id}
          className="aspect-square rounded-sm"
          style={{
            backgroundColor:
              day.intensity === 0
                ? "#ECECF2"
                : `color-mix(in srgb, var(--color-primary) ${Math.round(day.intensity * 100)}%, #EDEAFB)`,
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const user = MOCK_USER;

  return (
    <>
      <Header title="프로필" />
      <div className="space-y-6 px-5 pb-4">
        <section className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary-light">
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt={`${user.name} 프로필 사진`}
                fill
                className="object-cover"
                unoptimized
                sizes="64px"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold text-text-primary">
              {user.name}
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="primary">{user.temperature}°</Badge>
              <Badge variant="primary">
                <Flame size={12} className="mr-0.5 inline" aria-hidden />
                {user.totalStreakDays}일 연속
              </Badge>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
            내 스트릭 캘린더
          </h2>
          <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
            <StreakCalendar />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
            참여 챌린지
          </h2>
          <div className="space-y-2">
            {MOCK_CHALLENGES.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-card)]"
              >
                <span className="text-xl" aria-hidden>
                  {c.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">
                    {c.title}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {c.streakDays}일 연속 · {c.progress}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
            설정
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            {SETTINGS.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  className="flex h-14 w-full items-center gap-3 border-b border-[#F0F0F5] px-4 text-left last:border-b-0"
                >
                  <Icon size={18} className="text-text-secondary" aria-hidden />
                  <span className="flex-1 text-[14px] font-medium">
                    {label}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-text-secondary"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
