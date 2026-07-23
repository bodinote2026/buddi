/** Maximum share of item price payable with points (40%). */
export const MAX_POINT_RATIO = 0.4;

export interface PaymentSplit {
  pointsUsed: number;
  cashAmount: number;
}

/** Max points usable for an item given price cap and user balance. */
export function maxPointsForItem(price: number, userPoints: number): number {
  const priceCap = Math.floor(price * MAX_POINT_RATIO);
  return Math.max(0, Math.min(priceCap, userPoints, price));
}

/** Clamp client-provided points to valid range (server-side validation uses same rules). */
export function clampPointsUsed(
  pointsUsed: number,
  price: number,
  userPoints: number,
): number {
  const max = maxPointsForItem(price, userPoints);
  return Math.max(0, Math.min(Math.floor(pointsUsed), max));
}

export function splitPayment(
  price: number,
  pointsUsed: number,
  userPoints: number,
): PaymentSplit {
  const clamped = clampPointsUsed(pointsUsed, price, userPoints);
  return {
    pointsUsed: clamped,
    cashAmount: price - clamped,
  };
}
