import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { INTEREST_STYLES, MOCK_BUDDIES } from "@/lib/mock-data";
import { formatTemperature } from "@/lib/format";

export default function BuddiesPage() {
  return (
    <>
      <Header title="버디" />
      <div className="space-y-4 px-5 pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary">버디 찾기</h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            내 주변의 건강한 친구를 만나보세요
          </p>
        </div>

        <div className="space-y-3">
          {MOCK_BUDDIES.map((buddy) => (
            <article
              key={buddy.id}
              className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-primary-light">
                  <Image
                    src={buddy.avatarUrl}
                    alt={`${buddy.name} 프로필 사진`}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[16px] font-bold text-text-primary">
                        {buddy.name}{" "}
                        <span className="font-medium text-text-secondary">
                          {buddy.age}
                        </span>
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[13px] text-text-secondary">
                        <MapPin size={13} aria-hidden />
                        {buddy.district} · {buddy.distanceKm}km
                      </p>
                      <p className="mt-1 text-[13px] text-text-primary">
                        {buddy.intro}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[20px] font-bold text-text-primary">
                        {formatTemperature(buddy.temperature)}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        버디 온도
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(buddy.interests ?? []).map((interest) => {
                  const style = INTEREST_STYLES[interest] ?? {
                    emoji: "✨",
                    className: "bg-[#F0F0F5] text-text-secondary",
                  };
                  return (
                    <span
                      key={interest}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${style.className}`}
                    >
                      {style.emoji} {interest}
                    </span>
                  );
                })}
              </div>

              <Link
                href={`/chat/${buddy.id}`}
                className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-semibold text-white"
              >
                <MessageCircle size={16} aria-hidden />
                채팅 참여하기
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
