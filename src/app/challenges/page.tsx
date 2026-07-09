"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Check,
  Crown,
  Loader2,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { MOCK_TEAM_CHALLENGES, MOCK_TEAMS } from "@/lib/mock-data";
import type { Team, TeamChallenge } from "@/lib/types";

function TrendIcon({ trend }: { trend: Team["trend"] }) {
  if (trend === "상승")
    return <TrendingUp size={16} className="text-success" aria-label="상승" />;
  if (trend === "하락")
    return (
      <TrendingDown size={16} className="text-[#E74C3C]" aria-label="하락" />
    );
  return <Minus size={16} className="text-text-secondary" aria-label="유지" />;
}

export default function ChallengesPage() {
  const { showToast } = useToast();
  const [teams] = useState<Team[]>(MOCK_TEAMS);
  const [challenges, setChallenges] =
    useState<TeamChallenge[]>(MOCK_TEAM_CHALLENGES);
  const [createOpen, setCreateOpen] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<TeamChallenge | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [creating, setCreating] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canCreate = title.trim().length > 0 && department.trim().length > 0;

  async function handleCreate() {
    if (!canCreate || creating) return;
    setCreating(true);
    const optimistic: TeamChallenge = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      company: "바디노트",
      teamName: department.trim(),
      participants: 1,
      completionRate: 0,
    };
    setChallenges((prev) => [optimistic, ...prev]);
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
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "생성 실패");
      if (json.data) {
        setChallenges((prev) =>
          prev.map((c) => (c.id === optimistic.id ? json.data : c)),
        );
      }
      showToast("팀 챌린지가 생성되었어요! 팀원들에게 초대를 보냈어요.");
    } catch {
      setChallenges((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast("챌린지 생성에 실패했어요.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function completeCheckin(challenge: TeamChallenge) {
    if (checkingIn || challenge.checkedInToday) return;
    setCheckingIn(true);
    const bump = 2 + Math.floor(Math.random() * 4);
    const prev = challenges;
    setChallenges((list) =>
      list.map((c) =>
        c.id === challenge.id
          ? {
              ...c,
              completionRate: Math.min(100, c.completionRate + bump),
              checkedInToday: true,
            }
          : c,
      ),
    );
    setCheckinTarget(null);

    try {
      const res = await fetch(`/api/challenges/team/${challenge.id}/checkin`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "인증 실패");
      if (json.data) {
        setChallenges((list) =>
          list.map((c) =>
            c.id === challenge.id
              ? { ...json.data, checkedInToday: true }
              : c,
          ),
        );
      }
      showToast("오늘 인증이 완료되었어요!");
    } catch {
      setChallenges(prev);
      showToast("인증에 실패했어요. 다시 시도해 주세요.", "error");
    } finally {
      setCheckingIn(false);
    }
  }

  function handlePhotoAuth() {
    fileRef.current?.click();
  }

  async function handleHealthAuth() {
    if (!checkinTarget) return;
    setCheckingIn(true);
    await new Promise((r) => setTimeout(r, 700));
    setCheckingIn(false);
    await completeCheckin(checkinTarget);
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
                <p className="mt-1 text-[12px] text-text-secondary">팀 완료율</p>
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

      <Modal
        open={Boolean(checkinTarget)}
        title="오늘 인증하기"
        onClose={() => !checkingIn && setCheckinTarget(null)}
      >
        {checkinTarget && (
          <>
            <p className="mb-4 text-[14px] text-text-secondary">
              <strong className="font-bold text-text-primary">
                {checkinTarget.title}
              </strong>{" "}
              인증 방법을 선택하세요.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                disabled={checkingIn}
                onClick={handlePhotoAuth}
                className="flex w-full items-center gap-3 rounded-2xl bg-[#F0F0F5] p-4 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Camera size={20} aria-hidden />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-text-primary">
                    사진으로 인증
                  </span>
                  <span className="block text-[13px] text-text-secondary">
                    활동 사진을 직접 업로드해요
                  </span>
                </span>
              </button>
              <button
                type="button"
                disabled={checkingIn}
                onClick={handleHealthAuth}
                className="flex w-full items-center gap-3 rounded-2xl bg-[#F0F0F5] p-4 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E5F7F2] text-[#2A9B7A]">
                  {checkingIn ? (
                    <Loader2 size={20} className="animate-spin" aria-hidden />
                  ) : (
                    <Activity size={20} aria-hidden />
                  )}
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-text-primary">
                    건강 데이터 연동
                  </span>
                  <span className="block text-[13px] text-text-secondary">
                    바디노트 센서 기록을 불러와요
                  </span>
                </span>
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => {
                if (checkinTarget) void completeCheckin(checkinTarget);
              }}
            />
          </>
        )}
      </Modal>
    </>
  );
}
