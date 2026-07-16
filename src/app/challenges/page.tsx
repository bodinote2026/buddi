"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import {
  Camera,
  Check,
  Crown,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TeamCheckinModal } from "@/components/challenges/TeamCheckinModal";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ME_API_KEY } from "@/lib/me";
import { MOCK_TEAM_CHALLENGES, MOCK_TEAMS } from "@/lib/mock-data";
import type {
  ApiResponse,
  Team,
  TeamChallenge,
  TeamCheckinResult,
} from "@/lib/types";

function TrendIcon({ trend }: { trend: Team["trend"] }) {
  if (trend === "상승")
    return <TrendingUp size={16} className="text-success" aria-label="상승" />;
  if (trend === "하락")
    return (
      <TrendingDown size={16} className="text-[#E74C3C]" aria-label="하락" />
    );
  return <Minus size={16} className="text-text-secondary" aria-label="유지" />;
}

const TEAM_CHALLENGES_KEY = "/api/challenges/team";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || json.error || !json.data) {
    throw new Error(json.error ?? "불러오기 실패");
  }
  return json.data;
}

async function fetchTeamChallenges(): Promise<TeamChallenge[]> {
  return fetchJson<TeamChallenge[]>(TEAM_CHALLENGES_KEY);
}

export default function ChallengesPage() {
  const { showToast } = useToast();
  const { data: teams = MOCK_TEAMS } = useSWR("/api/teams/leaderboard", fetchJson<Team[]>);
  const { data: challenges = MOCK_TEAM_CHALLENGES, mutate: refreshChallenges } =
    useSWR(TEAM_CHALLENGES_KEY, fetchTeamChallenges);

  const [createOpen, setCreateOpen] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<TeamChallenge | null>(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [creating, setCreating] = useState(false);

  const canCreate = title.trim().length > 0 && department.trim().length > 0;

  async function handleCreate() {
    if (!canCreate || creating) return;
    setCreating(true);
    const optimistic: TeamChallenge = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      company: "바디노트",
      teamName: department.trim(),
      participants: 0,
      completionRate: 0,
      createdTime: new Date().toISOString(),
    };
    void refreshChallenges(
      (current) => [optimistic, ...(current ?? [])],
      { revalidate: false },
    );
    setCreateOpen(false);
    setTitle("");
    setDepartment("");

    try {
      const res = await fetch("/api/challenges/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: optimistic.title,
          department: optimistic.teamName,
        }),
      });
      const json = (await res.json()) as ApiResponse<TeamChallenge>;
      if (!res.ok || json.error || !json.data) {
        throw new Error(json.error ?? "생성 실패");
      }

      const created = json.data;
      await refreshChallenges(
        (current) => {
          const rest = (current ?? []).filter(
            (c) => c.id !== optimistic.id && c.id !== created.id,
          );
          return [created, ...rest];
        },
        { revalidate: false },
      );
      showToast("팀 챌린지가 생성되었어요! 팀원들에게 초대를 보냈어요.");
      void refreshChallenges();
    } catch {
      await refreshChallenges();
      showToast("챌린지 생성에 실패했어요.", "error");
    } finally {
      setCreating(false);
    }
  }

  function handleCheckinSuccess(result: TeamCheckinResult) {
    void refreshChallenges(
      (list) =>
        (list ?? []).map((c) =>
          c.id === result.challenge.id
            ? { ...result.challenge, checkedInToday: true }
            : c,
        ),
      false,
    );
    void mutate("/api/teams/leaderboard");
    void mutate(ME_API_KEY);
    showToast(`오늘 인증 완료! +50P (총 ${result.mileage.toLocaleString("ko-KR")}P)`);
  }

  return (
    <>
      <Header title="챌린지" />
      <div className="space-y-6 px-5 pb-4">
        <section>
          <h2 className="text-[18px] font-bold text-text-primary">팀 챌린지</h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            우리 회사, 우리 부서와 함께 건강하게
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-white"
          >
            <Plus size={18} aria-hidden />
            팀 챌린지 만들기
          </button>
        </section>

        <section>
          <h2 className="mb-3 text-[18px] font-bold text-text-primary">
            팀 리더보드
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            {teams.map((team, index) => (
              <li
                key={team.id}
                className="flex items-center gap-3 border-b border-[#F0F0F5] px-4 py-3.5 last:border-b-0"
              >
                {index === 0 ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    <Crown size={14} aria-hidden />
                  </span>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECECF2] text-[13px] font-semibold text-text-secondary">
                    {index + 1}
                  </span>
                )}
                <span className="flex-1 text-[14px] font-semibold text-text-primary">
                  {team.name}
                </span>
                <TrendIcon trend={team.trend} />
                <span
                  className={`min-w-[72px] text-right text-[14px] font-bold ${
                    index === 0 ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {team.points.toLocaleString("ko-KR")}P
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[18px] font-bold text-text-primary">
            참여 중인 챌린지
          </h2>
          <div className="space-y-3">
            {challenges.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"
              >
                <Link href={`/challenges/team/${c.id}`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium text-primary">
                      {c.company} · {c.teamName}
                    </p>
                    <span className="text-[22px] font-bold text-text-primary">
                      {c.completionRate}%
                    </span>
                  </div>
                  <h3 className="mt-1 text-[16px] font-bold text-text-primary">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] text-text-secondary">
                    <Users size={14} aria-hidden />
                    참여 {c.participants}명
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECECF2]">
                    <div
                      className="h-full rounded-full bg-[#3EC6A8] transition-all duration-500"
                      style={{ width: `${c.completionRate}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[12px] text-text-secondary">
                    팀 완료율 · 탭하여 상세 보기
                  </p>
                </Link>
                <button
                  type="button"
                  disabled={c.checkedInToday}
                  onClick={() => setCheckinTarget(c)}
                  className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors ${
                    c.checkedInToday
                      ? "bg-[#E8F5EE] text-success"
                      : "border border-primary bg-white text-primary hover:bg-primary-light"
                  }`}
                >
                  {c.checkedInToday ? (
                    <>
                      <Check size={18} aria-hidden />
                      인증 완료
                    </>
                  ) : (
                    <>
                      <Camera size={18} aria-hidden />
                      오늘 인증하기
                    </>
                  )}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={createOpen}
        title="팀 챌린지 만들기"
        onClose={() => setCreateOpen(false)}
      >
        <p className="mb-4 text-[14px] text-text-secondary">
          회사 또는 부서 단위로 새로운 웰니스 챌린지를 시작해보세요.
        </p>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            챌린지 이름
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2주 만보 걷기 챌린지"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="mb-5 block">
          <span className="mb-1.5 block text-[13px] font-bold text-text-primary">
            참여 부서
          </span>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="예: 마케팅 1팀"
            className="h-12 w-full rounded-xl bg-[#F0F0F5] px-4 text-[14px] outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <button
          type="button"
          disabled={!canCreate || creating}
          onClick={handleCreate}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white disabled:opacity-40"
        >
          챌린지 시작하기
        </button>
      </Modal>

      <TeamCheckinModal
        challenge={checkinTarget}
        open={Boolean(checkinTarget)}
        onClose={() => setCheckinTarget(null)}
        onSuccess={handleCheckinSuccess}
        onError={(msg) => showToast(msg, "error")}
      />
    </>
  );
}
