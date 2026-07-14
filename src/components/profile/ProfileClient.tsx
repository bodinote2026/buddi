"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronRight,
  LogOut,
  Thermometer,
  Trophy,
  Users,
  Watch,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { LoginButtons } from "@/components/auth/LoginButtons";
import {
  CONNECTED_DEVICES,
  MOCK_USER,
  PROFILE_SETTINGS,
} from "@/lib/mock-data";
import { formatTemperature } from "@/lib/format";
import type { User } from "@/lib/types";

interface ProfileClientProps {
  sessionUser: User | null;
}

function LoginGate() {
  return (
    <>
      <Header title="프로필" />
      <div className="flex flex-col px-5 pb-4 pt-8">
        <h2 className="text-[22px] font-bold text-text-primary">로그인</h2>
        <p className="mt-2 text-[14px] text-text-secondary">
          버디와 함께 건강한 습관을 시작해보세요
        </p>
        <div className="mt-8">
          <LoginButtons />
        </div>
        <p className="mt-4 text-center text-[12px] text-text-secondary">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </>
  );
}

function ProfileContent({ user }: { user: User }) {
  return (
    <>
      <Header title="프로필" showSettings />
      <div className="space-y-6 px-5 pb-4">
        <section className="flex flex-col items-center pt-2 text-center">
          <div className="relative h-[100px] w-[100px] overflow-hidden rounded-full border-[3px] border-primary-light bg-primary-light">
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt={`${user.name} 프로필 사진`}
                fill
                className="object-cover"
                unoptimized
                sizes="100px"
              />
            )}
          </div>
          <h2 className="mt-3 text-[22px] font-bold text-text-primary">
            {user.name}
          </h2>
          <p className="mt-0.5 text-[14px] text-text-secondary">
            @{user.handle ?? "buddi_user"}
          </p>
          {typeof user.trustPercentile === "number" &&
            user.trustPercentile > 0 && (
              <span className="mt-2 inline-flex items-center rounded-full bg-[#E8F5EE] px-3 py-1 text-[12px] font-medium text-success">
                🌡 신뢰도 최상위 {user.trustPercentile}%
              </span>
            )}
        </section>

        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-surface p-3 text-center shadow-[var(--shadow-card)]">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <Trophy size={18} aria-hidden />
            </span>
            <p className="mt-2 text-[18px] font-bold text-text-primary">
              {user.completedChallenges ?? 0}개
            </p>
            <p className="text-[11px] text-text-secondary">완료한 챌린지</p>
          </div>
          <div className="rounded-2xl bg-surface p-3 text-center shadow-[var(--shadow-card)]">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F7F2] text-[#2A9B7A]">
              <Thermometer size={18} aria-hidden />
            </span>
            <p className="mt-2 text-[18px] font-bold text-text-primary">
              {formatTemperature(user.temperature)}
            </p>
            <p className="text-[11px] text-text-secondary">버디 온도</p>
          </div>
          <div className="rounded-2xl bg-surface p-3 text-center shadow-[var(--shadow-card)]">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FDE8F0] text-[#D45B8C]">
              <Users size={18} aria-hidden />
            </span>
            <p className="mt-2 text-[18px] font-bold text-text-primary">
              {user.buddyCount ?? 0}명
            </p>
            <p className="text-[11px] text-text-secondary">나의 버디</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold text-text-primary">
            연결된 기기
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            {CONNECTED_DEVICES.map((device) => (
              <li
                key={device.id}
                className="flex items-center gap-3 border-b border-[#F0F0F5] px-4 py-3.5 last:border-b-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F5] text-text-secondary">
                  <Watch size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-text-primary">
                    {device.name}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {device.description}
                  </p>
                </div>
                {device.status === "connected" ? (
                  <span className="rounded-full bg-[#E8F5EE] px-2.5 py-1 text-[12px] font-medium text-success">
                    ✓ 연결됨
                  </span>
                ) : (
                  <button
                    type="button"
                    className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-white"
                  >
                    + 연동
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            {PROFILE_SETTINGS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex h-14 w-full items-center gap-3 border-b border-[#F0F0F5] px-4 text-left last:border-b-0"
                >
                  <span className="text-lg" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="flex-1 text-[14px] font-medium">
                    {item.label}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-text-secondary"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/profile" })}
                className="flex h-14 w-full items-center gap-3 px-4 text-left text-[#E74C3C]"
              >
                <LogOut size={18} aria-hidden />
                <span className="flex-1 text-[14px] font-medium">로그아웃</span>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

export function ProfileClient({ sessionUser }: ProfileClientProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <>
        <Header title="프로필" />
        <div className="space-y-4 px-5 pt-4">
          <div className="skeleton mx-auto h-24 w-24 rounded-full" />
          <div className="skeleton mx-auto h-6 w-32 rounded" />
          <div className="skeleton mx-auto h-4 w-40 rounded" />
        </div>
      </>
    );
  }

  if (!session?.user) {
    return <LoginGate />;
  }

  const user: User = sessionUser ?? {
    ...MOCK_USER,
    id: session.user.airtableId ?? "session-user",
    name: session.user.name ?? "버디 유저",
    avatarUrl: session.user.image ?? MOCK_USER.avatarUrl,
    handle: session.user.email?.split("@")[0] ?? "buddi_user",
    totalStreakDays: 0,
    temperature: 36.5,
    mileage: 0,
    completedChallenges: 0,
    buddyCount: 0,
    trustPercentile: undefined,
  };

  return <ProfileContent user={user} />;
}
