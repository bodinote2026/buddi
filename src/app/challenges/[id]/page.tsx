import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_CHALLENGES } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const challenge =
    MOCK_CHALLENGES.find((c) => c.id === id) ?? MOCK_CHALLENGES[0];

  return (
    <div className="px-5 pb-4">
      <header className="flex h-14 items-center gap-3">
        <Link
          href="/challenges"
          aria-label="뒤로가기"
          className="flex h-11 w-11 items-center justify-center text-text-primary"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-[18px] font-bold">챌린지 상세</h1>
      </header>

      <div className="mt-4 rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-card)]">
        <div className="text-4xl" aria-hidden>
          {challenge.emoji}
        </div>
        <h2 className="mt-3 text-[20px] font-bold text-text-primary">
          {challenge.title}
        </h2>
        <p className="mt-2 text-[14px] text-text-secondary">
          {challenge.description}
        </p>
        <p className="mt-6 text-[13px] text-text-secondary">
          상세 화면은 준비 중이에요.
        </p>
      </div>
    </div>
  );
}
