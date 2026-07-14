import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  TABLES,
  updateRecord,
} from "@/lib/airtable";
import { getDisplayName } from "@/lib/format";
import { mapUser } from "@/lib/mappers";
import { MOCK_USER } from "@/lib/mock-data";
import type { ApiResponse, User } from "@/lib/types";

function sessionFallbackUser(
  airtableId: string,
  session: Awaited<ReturnType<typeof auth>>,
): User {
  const nickname =
    session?.user?.nickname?.trim() ||
    session?.user?.name?.trim() ||
    "buddi_user";
  const name = "";
  return {
    id: airtableId,
    name,
    nickname,
    displayName: getDisplayName({ name, nickname }),
    totalStreakDays: 0,
    temperature: 36.5,
    avatarUrl: session?.user?.image ?? undefined,
    mileage: 0,
    completedChallenges: 0,
    buddyCount: 0,
    provider: session?.user?.provider,
    providerId: session?.user?.providerId,
    email: session?.user?.email ?? undefined,
  };
}

export async function GET() {
  try {
    const session = await auth();
    const airtableId = session?.user?.airtableId;

    if (airtableId) {
      if (isAirtableConfigured() && !airtableId.startsWith("mock-")) {
        try {
          const record = await getRecord(TABLES.users, airtableId);
          return NextResponse.json({
            data: mapUser(record),
            error: null,
          } satisfies ApiResponse<User>);
        } catch {
          // fall through
        }
      }

      return NextResponse.json({
        data: sessionFallbackUser(airtableId, session),
        error: null,
      } satisfies ApiResponse<User>);
    }

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

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const airtableId = session?.user?.airtableId;

    if (!airtableId) {
      return NextResponse.json(
        { data: null, error: "로그인이 필요합니다." } satisfies ApiResponse<User>,
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      nickname?: string;
    };

    const nickname = body.nickname?.trim() ?? "";
    if (!nickname) {
      return NextResponse.json(
        {
          data: null,
          error: "별명은 필수입니다.",
        } satisfies ApiResponse<User>,
        { status: 400 },
      );
    }

    const name = body.name?.trim() ?? "";

    if (!isAirtableConfigured() || airtableId.startsWith("mock-")) {
      const updated: User = {
        ...sessionFallbackUser(airtableId, session),
        name,
        nickname,
        displayName: getDisplayName({ name, nickname }),
      };
      return NextResponse.json({
        data: updated,
        error: null,
      } satisfies ApiResponse<User>);
    }

    const U = FIELDS.users;
    const updated = await updateRecord(TABLES.users, airtableId, {
      [U.name]: name,
      [U.nickname]: nickname,
    });

    return NextResponse.json({
      data: mapUser(updated),
      error: null,
    } satisfies ApiResponse<User>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "프로필 저장 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<User>,
      { status: 500 },
    );
  }
}
