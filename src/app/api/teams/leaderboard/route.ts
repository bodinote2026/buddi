import { NextResponse } from "next/server";
import {
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapTeam } from "@/lib/mappers";
import { MOCK_TEAMS } from "@/lib/mock-data";
import type { ApiResponse, Team } from "@/lib/types";

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_TEAMS,
        error: null,
      } satisfies ApiResponse<Team[]>);
    }

    const records = await listRecords(TABLES.teams, {
      "sort[0][field]": FIELDS.teams.points,
      "sort[0][direction]": "desc",
    });

    return NextResponse.json({
      data: records.map(mapTeam),
      error: null,
    } satisfies ApiResponse<Team[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_TEAMS,
      error: null,
    } satisfies ApiResponse<Team[]>);
  }
}
