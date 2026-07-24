"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import {
  Crown,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TeamChallengeCard } from "@/components/challenges/TeamChallengeCard";
import { TeamCheckinModal } from "@/components/challenges/TeamCheckinModal";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ME_API_KEY } from "@/lib/me";
import { MOCK_TEAM_CHALLENGES, MOCK_TEAMS, MOCK_USER } from "@/lib/mock-data";
import type {
  ApiResponse,
  Team,
  TeamChallenge,
  TeamCheckinResult,
  User,
} from "@/lib/types";

type LeaderboardScope = "all" | "mine";

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

function leaderboardKey(scope: LeaderboardScope) {
  return `/api/teams/leaderboard?scope=${scope}`;
}

function challengeCanParticipate(
  challenge: TeamChallenge,
  profile: User,
): boolean {
  if (challenge.canParticipate !== undefined) {
    return challenge.canParticipate;
  }

  const company = profile.company?.trim();
  const team = profile.team?.trim();
  if (!company || !team) return false;

  return (
    challenge.company?.trim() === company &&
    challenge.teamName?.trim() === team
  );
}

function partitionChallenges(challenges: TeamChallenge[], profile: User) {
  const participatable: TeamChallenge[] = [];
  const viewOnly: TeamChallenge[] = [];

  for (const challenge of challenges) {
    const canParticipate = challengeCanParticipate(challenge, profile);
    const normalized = { ...challenge, canParticipate };
    if (canParticipate) {
      participatable.push(normalized);
    } else {
      viewOnly.push(normalized);
    }
  }

  return { participatable, viewOnly };
}

export default function ChallengesPage() {
  const { showToast } = useToast();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const { data: me } = useSWR<User>(
    isLoggedIn ? ME_API_KEY : null,
    fetchJson<User>,
  );
  const profile = me ?? MOCK_USER;

  const [leaderboardScope, setLeaderboardScope] =
    useState<LeaderboardScope>("mine");
  const effectiveScope: LeaderboardScope = isLoggedIn ? leaderboardScope : "all";
  const company = profile.company?.trim() ?? "";
  const team = profile.team?.trim() ?? "";
  const showMineEmpty =
    isLoggedIn && effectiveScope === "mine" && !company;

  const { data: teams = MOCK_TEAMS } = useSWR<Team[]>(
    showMineEmpty ? null : leaderboardKey(effectiveScope),
    fetchJson<Team[]>,
  );

  const { data: challenges = MOCK_TEAM_CHALLENGES, mutate: refreshChallenges } =
    useSWR(TEAM_CHALLENGES_KEY, fetchTeamChallenges);

  const { participatable, viewOnly } = useMemo(
    () => partitionChallenges(challenges, profile),
    [challenges, profile],
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<TeamChallenge | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const canCreate = title.trim().length > 0 && Boolean(company && team);

  async function handleCreate() {
    if (!canCreate || creating) return;
    setCreating(true);
    const optimistic: TeamChallenge = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      company,
      teamName: team,
      participants: 0,
      completionRate: 0,
      canParticipate: true,
      createdTime: new Date().toISOString(),
    };
    void refreshChallenges(
      (current) => [optimistic, ...(current ?? [])],
      { revalidate: false },
    );
    setCreateOpen(false);
    setTitle("");

    try {
      const res = await fetch("/api/challenges/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: optimistic.title,
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
    } catch (err) {
      await refreshChallenges();
      showToast(
        err instanceof Error ? err.message : "챌린지 생성에 실패했어요.",
        "error",
      );
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
    void mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/teams/leaderboard"),
    );
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

          {isLoggedIn && (
            <div className="mb-3 flex rounded-full bg-[#ECECF2] p-1">
              <button
                type="button"
                onClick={() => setLeaderboardScope("mine")}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  effectiveScope === "mine"
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary"
                }`}
              >
                우리 회사
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardScope("all")}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  effectiveScope === "all"
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary"
                }`}
              >
                전체
              </button>
            </div>
          )}

          {showMineEmpty ? (
            <div className="rounded-2xl bg-surface px-4 py-8 text-center shadow-[var(--shadow-card)]">
              <p className="text-[14px] font-semibold text-text-primary">
                회사 정보가 없어 순위를 볼 수 없어요
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                프로필에서 회사와 부서를 입력하면
                <br />
                우리 회사 팀 순위를 확인할 수 있어요
              </p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
              {teams.map((entry, index) => (
                <li
                  key={entry.id}
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
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-text-primary">
                      {entry.name}
                    </span>
                    {effectiveScope === "all" && entry.company ? (
                      <span className="mt-0.5 block truncate text-[11px] text-text-secondary">
                        {entry.company}
                      </span>
                    ) : null}
                  </span>
                  <TrendIcon trend={entry.trend} />
                  <span
                    className={`min-w-[72px] text-right text-[14px] font-bold ${
                      index === 0 ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {entry.points.toLocaleString("ko-KR")}P
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-6">
          {participatable.length > 0 ? (
            <div>
              <h2 className="mb-3 text-[18px] font-bold text-text-primary">
                내가 참여 가능한 챌린지
              </h2>
              <div className="space-y-3">
                {participatable.map((c) => (
                  <TeamChallengeCard
                    key={c.id}
                    challenge={c}
                    showCheckin
                    onCheckin={setCheckinTarget}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {viewOnly.length > 0 ? (
            <div>
              <h2 className="mb-3 text-[18px] font-bold text-text-primary">
                다른 회사·부서 챌린지
              </h2>
              <div className="space-y-3">
                {viewOnly.map((c) => (
                  <TeamChallengeCard
                    key={c.id}
                    challenge={c}
                    showCheckin
                    onCheckin={setCheckinTarget}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {participatable.length === 0 && viewOnly.length === 0 ? (
            <div>
              <h2 className="mb-3 text-[18px] font-bold text-text-primary">
                참여 중인 챌린지
              </h2>
              <p className="rounded-2xl bg-surface px-4 py-8 text-center text-[14px] text-text-secondary shadow-[var(--shadow-card)]">
                아직 진행 중인 팀 챌린지가 없어요
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <Modal
        open={createOpen}
        title="팀 챌린지 만들기"
        onClose={() => setCreateOpen(false)}
      >
        {company && team ? (
          <p className="mb-4 text-[14px] text-text-secondary">
            {company} · {team}에서 진행할 챌린지를 만들어보세요
          </p>
        ) : (
          <p className="mb-4 text-[14px] text-text-secondary">
            프로필에 회사와 부서를 입력하면 챌린지를 만들 수 있어요.
          </p>
        )}
        <label className="mb-5 block">
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
