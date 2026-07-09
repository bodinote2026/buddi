import { NextResponse } from "next/server";
import {
  createRecord,
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapTeamChallenge } from "@/lib/mappers";
import { MOCK_TEAM_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, TeamChallenge } from "@/lib/types";

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_TEAM_CHALLENGES,
        error: null,
      } satisfies ApiResponse<TeamChallenge[]>);
    }

    const records = await listRecords(TABLES.teamChallenges);

    return NextResponse.json({
      data: records.map(mapTeamChallenge),
      error: null,
    } satisfies ApiResponse<TeamChallenge[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_TEAM_CHALLENGES,
      error: null,
    } satisfies ApiResponse<TeamChallenge[]>);
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
        participants: 1,
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
      [TC.participants]: 1,
      [TC.completionRate]: 0,
    };
    if (teams[0]) {
      fields[TC.team] = [teams[0].id];
    }

    const record = await createRecord(TABLES.teamChallenges, fields);
    const mapped = mapTeamChallenge(record);
    if (!mapped.teamName) mapped.teamName = department;

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
