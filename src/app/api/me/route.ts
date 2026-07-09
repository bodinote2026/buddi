import { NextResponse } from "next/server";
import { isAirtableConfigured, listRecords, TABLES } from "@/lib/airtable";
import { mapUser } from "@/lib/mappers";
import { MOCK_USER } from "@/lib/mock-data";
import type { ApiResponse, User } from "@/lib/types";

export async function GET() {
  try {
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
