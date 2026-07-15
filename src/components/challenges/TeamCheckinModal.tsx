"use client";

import { useRef, useState } from "react";
import { Activity, Camera, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { TeamChallenge, TeamCheckinResult } from "@/lib/types";

interface TeamCheckinModalProps {
  challenge: TeamChallenge | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (result: TeamCheckinResult) => void;
  onError: (message: string) => void;
}

export function TeamCheckinModal({
  challenge,
  open,
  onClose,
  onSuccess,
  onError,
}: TeamCheckinModalProps) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runCheckin(endpoint: string, body?: FormData) {
    if (!challenge || busy || challenge.checkedInToday) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok || json.error || !json.data) {
        throw new Error(json.error ?? "인증 실패");
      }
      onSuccess(json.data as TeamCheckinResult);
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : "인증에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  function handleHealthAuth() {
    if (!challenge) return;
    void runCheckin(`/api/challenges/team/${challenge.id}/checkin`);
  }

  function handlePhotoSelected(file: File | undefined) {
    if (!challenge || !file) return;
    const form = new FormData();
    form.append("image", file);
    void runCheckin(
      `/api/challenges/team/${challenge.id}/verify-photo`,
      form,
    );
  }

  return (
    <Modal
      open={open}
      title="오늘 인증하기"
      onClose={() => !busy && onClose()}
    >
      {challenge && (
        <>
          <p className="mb-4 text-[14px] text-text-secondary">
            <strong className="font-bold text-text-primary">
              {challenge.title}
            </strong>{" "}
            인증 방법을 선택하세요. 성공 시{" "}
            <strong className="text-primary">+50P</strong> 적립됩니다.
          </p>
          <div className="space-y-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
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
                  AI 자동 검증 후 포인트 적립
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleHealthAuth}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#F0F0F5] p-4 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E5F7F2] text-[#2A9B7A]">
                {busy ? (
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              handlePhotoSelected(file);
              e.target.value = "";
            }}
          />
        </>
      )}
    </Modal>
  );
}
