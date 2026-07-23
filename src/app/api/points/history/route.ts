import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getRecord,
  isAirtableConfigured,
  resolveSessionAirtableUserId,
  TABLES,
} from "@/lib/airtable";
import { mapUser } from "@/lib/mappers";
import { MOCK_USER } from "@/lib/mock-data";
import { getMockMileage } from "@/lib/mock-participants-store";
import { listPointLedgerHistory } from "@/lib/point-ledger";
import type { ApiResponse, PointHistoryResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = await resolveSessionAirtableUserId({
      airtableId: session?.user?.airtableId,
      provider: session?.user?.provider,
      providerId: session?.user?.providerId,
    });

    if (!userId) {
      return NextResponse.json(
        {
          data: null,
          error: "로그인이 필요합니다.",
        } satisfies ApiResponse<PointHistoryResponse>,
        { status: 401 },
      );
    }

    let balance = MOCK_USER.mileage ?? 0;
    if (isAirtableConfigured()) {
      try {
        const userRecord = await getRecord(TABLES.users, userId);
        balance = mapUser(userRecord).mileage ?? 0;
      } catch {
        balance = 0;
      }
    } else {
      balance = getMockMileage(userId);
    }

    const entries = await listPointLedgerHistory(userId);

    return NextResponse.json({
      data: { balance, entries },
      error: null,
    } satisfies ApiResponse<PointHistoryResponse>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "조회 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<PointHistoryResponse>,
      { status: 500 },
    );
  }
}
