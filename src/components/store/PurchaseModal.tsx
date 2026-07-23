"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatPoints } from "@/lib/format";
import {
  maxPointsForItem,
  splitPayment,
} from "@/lib/store-checkout";
import type { StoreItem } from "@/lib/types";
import { StoreItemThumbnail } from "./StoreItemThumbnail";

interface PurchaseModalProps {
  item: StoreItem | null;
  open: boolean;
  userPoints: number;
  onClose: () => void;
}

export function PurchaseModal({
  item,
  open,
  userPoints,
  onClose,
}: PurchaseModalProps) {
  const { showToast } = useToast();
  const maxPoints = item ? maxPointsForItem(item.price, userPoints) : 0;
  const step =
    maxPoints <= 100 ? 1 : maxPoints <= 1000 ? 10 : 100;
  const [pointsUsed, setPointsUsed] = useState(() =>
    item ? maxPointsForItem(item.price, userPoints) : 0,
  );
  const payment = item
    ? splitPayment(item.price, pointsUsed, userPoints)
    : { pointsUsed: 0, cashAmount: 0 };

  function adjustPoints(next: number) {
    if (!item) return;
    const max = maxPointsForItem(item.price, userPoints);
    setPointsUsed(Math.max(0, Math.min(Math.floor(next), max)));
  }

  function handlePaymentClick() {
    showToast("결제 기능은 준비 중이에요. 곧 만나요!");
  }

  if (!item) return null;

  return (
    <Modal open={open} title="구매하기" onClose={onClose}>
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F0F0F5] p-3">
        <StoreItemThumbnail item={item} size="sm" className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-text-secondary">{item.brand}</p>
          <p className="truncate text-[14px] font-bold text-text-primary">
            {item.name}
          </p>
          <p className="text-[14px] font-bold text-primary">
            {formatCurrency(item.price)}
          </p>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-text-primary">
            사용할 포인트
          </span>
          <span className="text-[14px] font-bold text-primary">
            {formatPoints(payment.pointsUsed)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="포인트 100 감소"
            onClick={() => adjustPoints(pointsUsed - 100)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0EA] text-text-primary"
          >
            <Minus size={16} aria-hidden />
          </button>
          <input
            type="range"
            min={0}
            max={maxPoints}
            step={step}
            value={Math.min(pointsUsed, maxPoints)}
            disabled={maxPoints === 0}
            onChange={(e) => adjustPoints(Number(e.target.value))}
            className="h-2 flex-1 accent-primary disabled:opacity-40"
            aria-label="사용할 포인트 조절"
          />
          <button
            type="button"
            aria-label="포인트 100 증가"
            onClick={() => adjustPoints(pointsUsed + 100)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0EA] text-text-primary"
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>

        <p className="text-[12px] text-text-secondary">
          최대 {formatPoints(maxPoints)}까지 사용 가능 (상품가의 40%)
        </p>
        <p className="text-[12px] text-text-secondary">
          보유 포인트 {formatPoints(userPoints)}
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-[#E0E0EA] px-4 py-3">
        <p className="text-[13px] text-text-secondary">결제 예정 금액</p>
        <p className="mt-1 text-[15px] font-bold text-text-primary">
          포인트 {formatPoints(payment.pointsUsed)} + 현금{" "}
          {formatCurrency(payment.cashAmount)}
        </p>
      </div>

      <button
        type="button"
        onClick={handlePaymentClick}
        className="flex h-12 w-full flex-col items-center justify-center rounded-full bg-[#ECECF2] text-text-secondary"
      >
        <span className="text-[14px] font-semibold">결제하기</span>
        <span className="text-[11px]">결제 연동 준비 중</span>
      </button>
    </Modal>
  );
}
