import { NextRequest, NextResponse } from "next/server";
import {
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapBuddy } from "@/lib/mappers";
import { MOCK_BUDDIES } from "@/lib/mock-data";
import type { ApiResponse, Buddy } from "@/lib/types";

export async function GET(request: NextRequest) {
  const recommended = request.nextUrl.searchParams.get("recommended") === "true";

  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_BUDDIES,
        error: null,
      } satisfies ApiResponse<Buddy[]>);
    }

    const params: Record<string, string> = {
      "sort[0][field]": FIELDS.buddies.temperature,
      "sort[0][direction]": "desc",
    };
    if (recommended) {
      params.filterByFormula = `{${FIELDS.buddies.isRecommended}}=TRUE()`;
    }

    const records = await listRecords(TABLES.buddies, params);

    return NextResponse.json({
      data: records.map(mapBuddy),
      error: null,
    } satisfies ApiResponse<Buddy[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_BUDDIES,
      error: null,
    } satisfies ApiResponse<Buddy[]>);
  }
}
