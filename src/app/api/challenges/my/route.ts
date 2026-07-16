import { NextResponse } from "next/server";
import {
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapUserChallenge } from "@/lib/mappers";
import { MOCK_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, Challenge } from "@/lib/types";

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_CHALLENGES,
        error: null,
      } satisfies ApiResponse<Challenge[]>);
    }

    const records = await listRecords(TABLES.userChallenges, {
      filterByFormula: `{${FIELDS.userChallenges.status}}="진행중"`,
    });

    return NextResponse.json({
      data: records.map(mapUserChallenge),
      error: null,
    } satisfies ApiResponse<Challenge[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_CHALLENGES,
      error: null,
    } satisfies ApiResponse<Challenge[]>);
  }
}
