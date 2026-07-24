"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronRight,
  LogOut,
  Sparkles,
  Thermometer,
  Trophy,
  Users,
  Watch,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { LoginButtons } from "@/components/auth/LoginButtons";
import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useToast } from "@/components/ui/Toast";
import {
  CONNECTED_DEVICES,
  INTEREST_OPTIONS,
  MOCK_USER,
  PROFILE_SETTINGS,
} from "@/lib/mock-data";
import { formatTemperature, formatPoints, getDisplayName } from "@/lib/format";
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

function ProfileContent({
  user,
  onUserChange,
}: {
  user: User;
  onUserChange: (user: User) => void;
}) {
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [age, setAge] = useState(
    user.age != null && user.age > 0 ? String(user.age) : "",
  );
  const [intro, setIntro] = useState(user.intro ?? "");
  const [interests, setInterests] = useState<string[]>(user.interests ?? []);
  const [company, setCompany] = useState(user.company ?? "");
  const [team, setTeam] = useState(user.team ?? "");
  const [saving, setSaving] = useState(false);

  const canSave =
    nickname.trim().length > 0 &&
    company.trim().length > 0 &&
    team.trim().length > 0;

  function openEdit() {
    setName(user.name);
    setNickname(user.nickname ?? "");
    setAge(user.age != null && user.age > 0 ? String(user.age) : "");
    setIntro(user.intro ?? "");
    setInterests(user.interests ?? []);
    setCompany(user.company ?? "");
    setTeam(user.team ?? "");
    setEditOpen(true);
  }

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    const prev = user;
    const nextName = name.trim();
    const nextNickname = nickname.trim();
    const parsedAge = age.trim() ? Math.floor(Number(age)) : null;
    const nextIntro = intro.trim();
    const nextCompany = company.trim();
    const nextTeam = team.trim();
    const optimistic: User = {
      ...user,
      name: nextName,
      nickname: nextNickname,
      displayName: getDisplayName({ name: nextName, nickname: nextNickname }),
      company: nextCompany,
      team: nextTeam,
      age:
        parsedAge != null && parsedAge > 0 && !Number.isNaN(parsedAge)
          ? parsedAge
          : undefined,
      intro: nextIntro || undefined,
      interests: interests.length > 0 ? interests : undefined,
    };
    onUserChange(optimistic);
    setEditOpen(false);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          nickname: nextNickname,
          company: nextCompany,
          team: nextTeam,
          age:
            parsedAge != null && parsedAge > 0 && !Number.isNaN(parsedAge)
              ? parsedAge
              : null,
          intro: nextIntro,
          interests,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "저장 실패");
      if (json.data) onUserChange(json.data);
      showToast("프로필이 저장되었어요.");
    } catch {
      onUserChange(prev);
      showToast("프로필 저장에 실패했어요.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title="프로필" showSettings onSettingsClick={openEdit} />
      <div className="space-y-6 px-5 pb-4">
        <section className="flex flex-col items-center pt-2 text-center">
          <UserAvatar
            src={user.avatarUrl}
            alt={`${user.displayName} 프로필 사진`}
            shape="circle"
            className="h-[100px] w-[100px] border-[3px] border-primary-light"
            sizes="100px"
          />
          <h2 className="mt-3 text-[22px] font-bold text-text-primary">
            {user.displayName}
          </h2>
          <p className="mt-0.5 text-[14px] text-text-secondary">
            @{user.nickname ?? "buddi_user"}
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

        <section className="relative overflow-hidden rounded-2xl bg-primary p-4 text-white shadow-[var(--shadow-card)]">
          <p className="flex items-center gap-1.5 text-[13px] text-white/90">
            <Sparkles size={14} aria-hidden />
            내 BUDDI 포인트
          </p>
          <p className="mt-1 text-[24px] font-bold tracking-tight">
            {formatPoints(user.mileage ?? 0)}
          </p>
          <Link
            href="/points/history"
            className="mt-2 inline-block text-[12px] font-medium text-white/90 underline underline-offset-2"
          >
            내역 보기
          </Link>
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

      <Modal
        open={editOpen}
        title="프로필 편집"
        onClose={() => !saving && setEditOpen(false)}
      >
        <p className="mb-4 text-[12px] text-text-secondary">
          이 정보를 입력하면 동료들에게 버디로 추천될 수 있어요
        </p>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            이름
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력해주세요 (선택)"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            별명
          </span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="다른 사람에게 보여질 별명"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            회사
          </span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="예: 바디노트"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            부서
          </span>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="예: 마케팅 1팀"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            나이
          </span>
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="선택 입력"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            한 줄 소개
          </span>
          <input
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="나를 소개해보세요"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <div className="mb-5">
          <span className="mb-2 block text-[13px] font-bold text-text-primary">
            관심사
          </span>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    selected
                      ? "bg-primary-light text-primary"
                      : "bg-[#F0F0F5] text-text-secondary"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={handleSave}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white disabled:opacity-40"
        >
          저장하기
        </button>
      </Modal>
    </>
  );
}

export function ProfileClient({ sessionUser }: ProfileClientProps) {
  const { data: session, status } = useSession();
  const [userOverride, setUserOverride] = useState<User | null>(null);

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

  const nickname =
    sessionUser?.nickname ||
    session.user.nickname ||
    session.user.name ||
    "buddi_user";
  const name = sessionUser?.name ?? "";

  const baseUser: User = sessionUser ?? {
    ...MOCK_USER,
    id: session.user.airtableId ?? "session-user",
    name,
    nickname,
    displayName: getDisplayName({ name, nickname }),
    avatarUrl: session.user.image ?? MOCK_USER.avatarUrl,
    totalStreakDays: 0,
    temperature: 36.5,
    mileage: 0,
    completedChallenges: 0,
    buddyCount: 0,
    trustPercentile: undefined,
  };

  const user = userOverride ?? baseUser;

  return <ProfileContent user={user} onUserChange={setUserOverride} />;
}
