import {
  createRecord,
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "./airtable";
import { mapPointLedgerEntry } from "./mappers";
import {
  addMockPointLedgerEntry,
  listMockPointLedgerEntries,
} from "./mock-point-ledger-store";
import type { PointLedgerEntry, PointLedgerType } from "./types";

const HISTORY_LIMIT = 50;

function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function recordPointLedgerEntry(input: {
  userId: string;
  type: PointLedgerType;
  amount: number;
  reason: string;
  balanceAfter: number;
}): Promise<PointLedgerEntry | null> {
  const amount = Math.floor(Math.abs(input.amount));
  if (amount <= 0) return null;

  if (!isAirtableConfigured()) {
    return addMockPointLedgerEntry(input.userId, {
      type: input.type,
      amount,
      reason: input.reason,
      balanceAfter: input.balanceAfter,
    });
  }

  const PL = FIELDS.pointLedger;
  try {
    const record = await createRecord(TABLES.pointLedger, {
      [PL.user]: [input.userId],
      [PL.type]: input.type,
      [PL.amount]: amount,
      [PL.reason]: input.reason,
      [PL.balanceAfter]: input.balanceAfter,
    });
    return mapPointLedgerEntry(record);
  } catch (err) {
    console.error("[point-ledger] create failed", err);
    return null;
  }
}

export async function listPointLedgerHistory(
  userId: string,
): Promise<PointLedgerEntry[]> {
  if (!isAirtableConfigured()) {
    return listMockPointLedgerEntries(userId, HISTORY_LIMIT);
  }

  const PL = FIELDS.pointLedger;
  const escapedUserId = escapeFormulaValue(userId);
  const records = await listRecords(
    TABLES.pointLedger,
    {
      filterByFormula: `{${PL.user}}="${escapedUserId}"`,
      maxRecords: String(HISTORY_LIMIT),
    },
    { skipCache: true },
  );

  return records
    .map(mapPointLedgerEntry)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, HISTORY_LIMIT);
}
