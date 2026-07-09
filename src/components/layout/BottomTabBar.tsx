"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  Users,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/challenges", label: "챌린지", icon: Trophy },
  { href: "/buddies", label: "버디", icon: Users },
  { href: "/store", label: "스토어", icon: ShoppingBag },
  { href: "/profile", label: "프로필", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="메인 네비게이션"
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-[#ECECF2] bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-16 items-stretch">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-text-secondary"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.15 : 0}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
