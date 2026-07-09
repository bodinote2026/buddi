import { NextResponse } from "next/server";
import {
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapChallenge } from "@/lib/mappers";
import { MOCK_EXPLORE_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, ExploreChallenge } from "@/lib/types";

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_EXPLORE_CHALLENGES,
        error: null,
      } satisfies ApiResponse<ExploreChallenge[]>);
    }

    const records = await listRecords(TABLES.challenges, {
      filterByFormula: `{${FIELDS.challenges.isActive}}=TRUE()`,
    });

    return NextResponse.json({
      data: records.map(mapChallenge),
      error: null,
    } satisfies ApiResponse<ExploreChallenge[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_EXPLORE_CHALLENGES,
      error: null,
    } satisfies ApiResponse<ExploreChallenge[]>);
  }
}
