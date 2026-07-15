import { NextResponse } from "next/server";
import {
  createRecord,
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapTeamChallenge } from "@/lib/mappers";
import { listTeamChallengesWithCounts } from "@/lib/team-checkin";
import type { ApiResponse, TeamChallenge } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listTeamChallengesWithCounts();
    return NextResponse.json({
      data,
      error: null,
    } satisfies ApiResponse<TeamChallenge[]>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "조회 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<TeamChallenge[]>,
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      department?: string;
    };
    const title = body.title?.trim();
    const department = body.department?.trim();

    if (!title || !department) {
      return NextResponse.json(
        {
          data: null,
          error: "챌린지 이름과 참여 부서를 입력해 주세요.",
        } satisfies ApiResponse<TeamChallenge>,
        { status: 400 },
      );
    }

    if (!isAirtableConfigured()) {
      const created: TeamChallenge = {
        id: `mock-${Date.now()}`,
        title,
        company: "바디노트",
        teamName: department,
        participants: 0,
        completionRate: 0,
      };
      return NextResponse.json({
        data: created,
        error: null,
      } satisfies ApiResponse<TeamChallenge>);
    }

    const TC = FIELDS.teamChallenges;
    const teams = await listRecords(TABLES.teams, {
      filterByFormula: `{${FIELDS.teams.name}}="${department.replace(/"/g, '\\"')}"`,
      maxRecords: "1",
    });

    const fields: Record<string, unknown> = {
      [TC.title]: title,
      [TC.company]: "바디노트",
      [TC.completionRate]: 0,
    };
    if (teams[0]) {
      fields[TC.team] = [teams[0].id];
    }

    const record = await createRecord(TABLES.teamChallenges, fields);
    const mapped = mapTeamChallenge(record);
    if (!mapped.teamName) mapped.teamName = department;
    mapped.participants = 0;

    return NextResponse.json({
      data: mapped,
      error: null,
    } satisfies ApiResponse<TeamChallenge>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "생성 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<TeamChallenge>,
      { status: 500 },
    );
  }
}
