import type { PointLedgerEntry } from "./types";

const entriesByUser = new Map<string, PointLedgerEntry[]>();

export function addMockPointLedgerEntry(
  userId: string,
  input: Omit<PointLedgerEntry, "id" | "createdAt">,
): PointLedgerEntry {
  const entry: PointLedgerEntry = {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  const list = entriesByUser.get(userId) ?? [];
  list.unshift(entry);
  entriesByUser.set(userId, list);
  return entry;
}

export function listMockPointLedgerEntries(
  userId: string,
  limit = 50,
): PointLedgerEntry[] {
  return (entriesByUser.get(userId) ?? []).slice(0, limit);
}
