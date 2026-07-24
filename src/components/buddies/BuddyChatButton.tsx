"use client";

import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BuddyChatButtonProps {
  label?: string;
  className?: string;
}

export function BuddyChatButton({
  label = "채팅하기",
  className = "mt-auto flex h-9 w-full items-center justify-center gap-1 rounded-full bg-primary text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark",
}: BuddyChatButtonProps) {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast("채팅 기능은 준비 중이에요. 곧 만나요!")}
      className={className}
    >
      <MessageCircle size={14} aria-hidden />
      {label}
    </button>
  );
}
