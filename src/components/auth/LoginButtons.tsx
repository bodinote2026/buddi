"use client";

import { signIn } from "next-auth/react";

export type AuthProviderId = "kakao"; // extend with "google" later

interface ProviderButton {
  id: AuthProviderId;
  label: string;
  className: string;
  icon: React.ReactNode;
}

const PROVIDER_BUTTONS: ProviderButton[] = [
  {
    id: "kakao",
    label: "카카오로 시작하기",
    className: "bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00]",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 1.5C4.85775 1.5 1.5 4.11267 1.5 7.335c0 2.073 1.38075 3.894 3.45675 4.932L4.218 15.375c-.0675.2475.225.4425.4425.3225l3.645-2.415c.225.015.4575.0225.6945.0225 4.14225 0 7.5-2.61267 7.5-5.835S13.14225 1.5 9 1.5z"
          fill="#191919"
        />
      </svg>
    ),
  },
];

export function LoginButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      {PROVIDER_BUTTONS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => signIn(provider.id, { callbackUrl: "/profile" })}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-colors ${provider.className}`}
        >
          {provider.icon}
          {provider.label}
        </button>
      ))}
    </div>
  );
}
