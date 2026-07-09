import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_BUDDIES } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ buddyId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { buddyId } = await params;
  const buddy =
    MOCK_BUDDIES.find((b) => b.id === buddyId) ?? MOCK_BUDDIES[0];

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col">
      <header className="flex h-14 items-center gap-3 border-b border-[#ECECF2] px-5">
        <Link
          href="/buddies"
          aria-label="뒤로가기"
          className="flex h-11 w-11 items-center justify-center text-text-primary"
        >
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-[16px] font-bold text-text-primary">
            {buddy.name}
          </h1>
          <p className="text-[12px] text-text-secondary">{buddy.category}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
        <p className="text-[15px] font-medium text-text-primary">
          {buddy.name}님과의 채팅
        </p>
        <p className="text-[13px] text-text-secondary">
          채팅 UI는 곧 제공될 예정이에요.
        </p>
      </div>

      <div className="border-t border-[#ECECF2] px-5 py-3">
        <div className="flex h-11 items-center rounded-full bg-[#ECECF2] px-4 text-[14px] text-text-secondary">
          메시지를 입력하세요
        </div>
      </div>
    </div>
  );
}
