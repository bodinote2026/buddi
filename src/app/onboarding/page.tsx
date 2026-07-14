"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { type KeyedMutator } from "swr";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { needsOnboarding } from "@/lib/format";
import { fetchMe, ME_API_KEY } from "@/lib/me";
import type { ApiResponse, User } from "@/lib/types";

function OnboardingForm({
  initial,
  fallbackNickname,
  mutateMe,
}: {
  initial: User;
  fallbackNickname?: string | null;
  mutateMe: KeyedMutator<User>;
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
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit =
    nickname.trim().length > 0 &&
    company.trim().length > 0 &&
    team.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(ME_API_KEY, {
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
      if (!res.ok || json.error || !json.data) {
        throw new Error(json.error ?? `저장 실패 (${res.status})`);
      }

      if (needsOnboarding(json.data)) {
        throw new Error(
          "저장 응답에 회사/부서 정보가 없습니다. Airtable Company·Team 필드를 확인해 주세요.",
        );
      }

      // Update the same SWR cache the OnboardingGuard reads — do not
      // revalidate yet (would refetch empty mock/stale Airtable and bounce).
      await mutateMe(json.data, { revalidate: false });
      showToast("프로필이 저장되었어요.");
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "저장에 실패했어요.";
      console.error("[onboarding] submit failed", err);
      setFormError(message);
      showToast(message, "error");
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

      {formError && (
        <p className="mt-4 text-[13px] text-[#E74C3C]" role="alert">
          {formError}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit || saving}
        onClick={handleSubmit}
        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white disabled:opacity-40"
      >
        {saving ? "저장 중…" : "시작하기"}
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: me, isLoading, mutate } = useSWR(
    status === "authenticated" ? ME_API_KEY : null,
    fetchMe,
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
      mutateMe={mutate}
    />
  );
}
