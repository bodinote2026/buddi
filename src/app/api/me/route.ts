import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getRecord,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapUser } from "@/lib/mappers";
import { MOCK_USER } from "@/lib/mock-data";
import type { ApiResponse, User } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    const airtableId = session?.user?.airtableId;

    // Logged-in: resolve session user (Airtable or mock session defaults)
    if (airtableId) {
      if (isAirtableConfigured() && !airtableId.startsWith("mock-")) {
        try {
          const record = await getRecord(TABLES.users, airtableId);
          return NextResponse.json({
            data: mapUser(record),
            error: null,
          } satisfies ApiResponse<User>);
        } catch {
          // fall through to session-derived user
        }
      }

      const sessionUser: User = {
        id: airtableId,
        name: session?.user?.name ?? "버디 유저",
        totalStreakDays: 0,
        temperature: 36.5,
        avatarUrl: session?.user?.image ?? undefined,
        nickname:
          session?.user?.email?.split("@")[0] ??
          session?.user?.name?.replace(/\s+/g, "_").toLowerCase() ??
          "buddi_user",
        mileage: 0,
        completedChallenges: 0,
        buddyCount: 0,
        provider: session?.user?.provider,
        providerId: session?.user?.providerId,
        email: session?.user?.email ?? undefined,
      };

      return NextResponse.json({
        data: sessionUser,
        error: null,
      } satisfies ApiResponse<User>);
    }

    // Guest: keep demo user (한지우)
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_USER,
        error: null,
      } satisfies ApiResponse<User>);
    }

    const records = await listRecords(TABLES.users, { maxRecords: "1" });
    if (!records[0]) {
      return NextResponse.json({
        data: MOCK_USER,
        error: null,
      } satisfies ApiResponse<User>);
    }

    return NextResponse.json({
      data: mapUser(records[0]),
      error: null,
    } satisfies ApiResponse<User>);
  } catch {
    return NextResponse.json({
      data: MOCK_USER,
      error: null,
    } satisfies ApiResponse<User>);
  }
}
