import { NextResponse } from "next/server";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  updateRecord,
  TABLES,
} from "@/lib/airtable";
import { mapTeamChallenge } from "@/lib/mappers";
import { MOCK_TEAM_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, TeamChallenge } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const TC = FIELDS.teamChallenges;
  const bump = 2 + Math.floor(Math.random() * 4);

  try {
    if (!isAirtableConfigured()) {
      const mock = MOCK_TEAM_CHALLENGES.find((c) => c.id === id);
      if (!mock) {
        return NextResponse.json(
          {
            data: null,
            error: "챌린지를 찾을 수 없습니다.",
          } satisfies ApiResponse<TeamChallenge>,
          { status: 404 },
        );
      }
      const updated: TeamChallenge = {
        ...mock,
        completionRate: Math.min(100, mock.completionRate + bump),
        checkedInToday: true,
      };
      return NextResponse.json({
        data: updated,
        error: null,
      } satisfies ApiResponse<TeamChallenge>);
    }

    const current = await getRecord(TABLES.teamChallenges, id);
    const rate = Number(current.fields[TC.completionRate] ?? 0);
    const updated = await updateRecord(TABLES.teamChallenges, id, {
      [TC.completionRate]: Math.min(100, rate + bump),
    });

    return NextResponse.json({
      data: { ...mapTeamChallenge(updated), checkedInToday: true },
      error: null,
    } satisfies ApiResponse<TeamChallenge>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "인증 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<TeamChallenge>,
      { status: 500 },
    );
  }
}
