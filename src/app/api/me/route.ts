import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  resolveSessionAirtableUserId,
  TABLES,
  updateRecord,
} from "@/lib/airtable";
import { getDisplayName } from "@/lib/format";
import { mapUser } from "@/lib/mappers";
import { MOCK_USER } from "@/lib/mock-data";
import { getMockProfile, saveMockProfile } from "@/lib/mock-profile-store";
import type { ApiResponse, User } from "@/lib/types";

function sessionFallbackUser(
  airtableId: string,
  session: Session | null,
): User {
  const cached = getMockProfile(airtableId);
  if (cached) return cached;

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
    company: "",
    team: "",
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

async function resolveMeUserId(session: Session | null): Promise<string | undefined> {
  const airtableId = session?.user?.airtableId;
  if (!airtableId) return undefined;

  if (!isAirtableConfigured() || airtableId.startsWith("mock-")) {
    return airtableId;
  }

  const resolved = await resolveSessionAirtableUserId({
    airtableId,
    provider: session?.user?.provider,
    providerId: session?.user?.providerId,
  });
  return resolved ?? airtableId;
}

export async function GET() {
  try {
    const session = await auth();
    const airtableId = await resolveMeUserId(session);

    if (airtableId) {
      if (isAirtableConfigured() && !airtableId.startsWith("mock-")) {
        try {
          const record = await getRecord(TABLES.users, airtableId);
          const user = mapUser(record);
          console.info("[api/me GET] loaded user", {
            id: user.id,
            hasCompany: Boolean(user.company?.trim()),
            hasTeam: Boolean(user.team?.trim()),
          });
          return NextResponse.json({
            data: user,
            error: null,
          } satisfies ApiResponse<User>);
        } catch (err) {
          console.error("[api/me GET] Airtable getRecord failed", err);
          // fall through to session fallback / mock store
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
  } catch (err) {
    console.error("[api/me GET]", err);
    return NextResponse.json({
      data: MOCK_USER,
      error: null,
    } satisfies ApiResponse<User>);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const airtableId = await resolveMeUserId(session);

    if (!airtableId) {
      return NextResponse.json(
        { data: null, error: "로그인이 필요합니다." } satisfies ApiResponse<User>,
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      nickname?: string;
      company?: string;
      team?: string;
      age?: number | null;
      intro?: string;
      interests?: string[];
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
    const hasOrgFields = "company" in body || "team" in body;
    const company = body.company?.trim() ?? "";
    const team = body.team?.trim() ?? "";
    const hasBuddyFields =
      "age" in body || "intro" in body || "interests" in body;
    const age =
      "age" in body && body.age != null && body.age > 0
        ? Math.floor(body.age)
        : undefined;
    const intro = "intro" in body ? body.intro?.trim() ?? "" : undefined;
    const interests =
      "interests" in body
        ? (body.interests ?? []).filter((value): value is string =>
            typeof value === "string",
          )
        : undefined;

    if (hasOrgFields && (!company || !team)) {
      return NextResponse.json(
        {
          data: null,
          error: "회사와 부서는 필수입니다.",
        } satisfies ApiResponse<User>,
        { status: 400 },
      );
    }

    const useMock =
      !isAirtableConfigured() || airtableId.startsWith("mock-");

    if (useMock) {
      const base = sessionFallbackUser(airtableId, session);
      const updated: User = {
        ...base,
        name,
        nickname,
        displayName: getDisplayName({ name, nickname }),
        ...(hasOrgFields ? { company, team } : {}),
        ...(hasBuddyFields
          ? {
              age,
              intro: intro || undefined,
              interests:
                interests && interests.length > 0 ? interests : undefined,
            }
          : {}),
      };
      saveMockProfile(updated);
      return NextResponse.json({
        data: updated,
        error: null,
      } satisfies ApiResponse<User>);
    }

    const U = FIELDS.users;
    const fields: Record<string, unknown> = {
      [U.name]: name,
      [U.nickname]: nickname,
    };
    if (hasOrgFields) {
      fields[U.company] = company;
      fields[U.team] = team;
    }
    if ("age" in body) {
      fields[U.age] = age ?? null;
    }
    if ("intro" in body) {
      fields[U.intro] = intro ?? "";
    }
    if ("interests" in body) {
      fields[U.interests] = interests ?? [];
    }

    const updated = await updateRecord(TABLES.users, airtableId, fields);
    const mapped = mapUser(updated);

    // Ensure response always carries submitted org fields even if Airtable
    // omits empty-adjacent fields from the PATCH response payload.
    const data: User = {
      ...mapped,
      name,
      nickname,
      displayName: getDisplayName({ name, nickname }),
      ...(hasOrgFields ? { company, team } : {}),
      ...(hasBuddyFields
        ? {
            age,
            intro: intro || undefined,
            interests:
              interests && interests.length > 0 ? interests : undefined,
          }
        : {}),
    };

    return NextResponse.json({
      data,
      error: null,
    } satisfies ApiResponse<User>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "프로필 저장 실패";
    console.error("[api/me PATCH]", message, err);
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<User>,
      { status: 500 },
    );
  }
}
