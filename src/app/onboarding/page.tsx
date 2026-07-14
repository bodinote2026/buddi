"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { needsOnboarding } from "@/lib/format";
import type { ApiResponse, User } from "@/lib/types";

async function fetcher(url: string): Promise<User> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<User>;
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "프로필을 불러오지 못했어요.");
  }
  return json.data;
}

function OnboardingForm({
  initial,
  fallbackNickname,
}: {
  initial: User;
  fallbackNickname?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(initial.name ?? "");
  const [nickname, setNickname] = useState(
    initial.nickname || fallbackNickname || "",
  );
  const [company, setCompany] = useState(initial.company ?? "");
  const [team, setTeam] = useState(initial.team ?? "");
  const [saving, setSaving] = useState(false);

  const canSubmit =
    nickname.trim().length > 0 &&
    company.trim().length > 0 &&
    team.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nickname: nickname.trim(),
          company: company.trim(),
          team: team.trim(),
        }),
      });
      const json = (await res.json()) as ApiResponse<User>;
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "저장에 실패했어요.");
      }
      showToast("프로필이 저장되었어요.");
      router.replace("/");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "저장에 실패했어요.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-10">
      <h1 className="text-[22px] font-bold text-text-primary">
        프로필을 완성해주세요
      </h1>
      <p className="mt-2 text-[14px] text-text-secondary">
        팀 챌린지 참여를 위해 몇 가지만 알려주세요
      </p>

      <div className="mt-8 space-y-4">
        <label className="block">
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
        <label className="block">
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
        <label className="block">
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
        <label className="block">
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
      </div>

      <button
        type="button"
        disabled={!canSubmit || saving}
        onClick={handleSubmit}
        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white disabled:opacity-40"
      >
        시작하기
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: me, isLoading } = useSWR(
    status === "authenticated" ? "/api/me" : null,
    fetcher,
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (me && !needsOnboarding(me)) {
      router.replace("/");
    }
  }, [me, router]);

  if (status === "loading" || isLoading || !me) {
    return (
      <div className="flex min-h-dvh flex-col justify-center px-5">
        <div className="skeleton mb-3 h-7 w-48 rounded" />
        <div className="skeleton mb-8 h-4 w-64 rounded" />
        <div className="space-y-3">
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!needsOnboarding(me)) {
    return null;
  }

  return (
    <OnboardingForm
      key={me.id}
      initial={me}
      fallbackNickname={session?.user?.nickname ?? session?.user?.name}
    />
  );
}
