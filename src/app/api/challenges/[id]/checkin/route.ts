import { NextResponse } from "next/server";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  updateRecord,
  TABLES,
} from "@/lib/airtable";
import { mapUserChallenge } from "@/lib/mappers";
import { MOCK_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, Challenge } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const UC = FIELDS.userChallenges;

  try {
    if (!isAirtableConfigured()) {
      const mock = MOCK_CHALLENGES.find((c) => c.id === id);
      if (!mock) {
        return NextResponse.json(
          { data: null, error: "챌린지를 찾을 수 없습니다." } satisfies ApiResponse<Challenge>,
          { status: 404 },
        );
      }
      const updated: Challenge = {
        ...mock,
        progress: Math.min(100, mock.progress + 5),
        streakDays: mock.streakDays + 1,
      };
      return NextResponse.json({
        data: updated,
        error: null,
      } satisfies ApiResponse<Challenge>);
    }

    const current = await getRecord(TABLES.userChallenges, id);
    const progress = Number(current.fields[UC.progress] ?? 0);
    const streakDays = Number(current.fields[UC.streakDays] ?? 0);

    const updated = await updateRecord(TABLES.userChallenges, id, {
      [UC.progress]: Math.min(100, progress + 5),
      [UC.streakDays]: streakDays + 1,
      [UC.lastCheckinAt]: new Date().toISOString().slice(0, 10),
    });

    return NextResponse.json({
      data: mapUserChallenge(updated),
      error: null,
    } satisfies ApiResponse<Challenge>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "인증 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<Challenge>,
      { status: 500 },
    );
  }
}
