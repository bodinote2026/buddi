import { NextResponse } from "next/server";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  TABLES,
  updateRecord,
} from "@/lib/airtable";
import { mapBuddy } from "@/lib/mappers";
import { BUDDY_AVATAR_URLS } from "@/lib/mock-data";
import type { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

function avatarFieldValue(url: string): string {
  return url;
}

export async function GET() {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { data: null, error: "Airtable이 설정되지 않았습니다." } satisfies ApiResponse<null>,
      { status: 503 },
    );
  }

  try {
    const B = FIELDS.buddies;
    const records = await listRecords(TABLES.buddies, undefined, {
      skipCache: true,
    });
    const buddies = records.map((record) => ({
      id: record.id,
      name: String(record.fields[B.name] ?? ""),
      rawAvatarUrl: record.fields[B.avatarUrl] ?? null,
      mapped: mapBuddy(record),
    }));

    return NextResponse.json({
      data: { buddies },
      error: null,
    } satisfies ApiResponse<{ buddies: typeof buddies }>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "조회 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function POST() {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { data: null, error: "Airtable이 설정되지 않았습니다." } satisfies ApiResponse<null>,
      { status: 503 },
    );
  }

  try {
    const B = FIELDS.buddies;
    const records = await listRecords(TABLES.buddies);
    const updated: { id: string; name: string; avatarUrl: string }[] = [];

    for (const record of records) {
      const name = String(record.fields[B.name] ?? "");
      const url = BUDDY_AVATAR_URLS[name as keyof typeof BUDDY_AVATAR_URLS];
      if (!url) continue;

      await updateRecord(TABLES.buddies, record.id, {
        [B.avatarUrl]: avatarFieldValue(url),
      });
      const verified = mapBuddy(await getRecord(TABLES.buddies, record.id));
      updated.push({
        id: record.id,
        name,
        avatarUrl: verified.avatarUrl,
      });
    }

    return NextResponse.json({
      data: { updated },
      error: null,
    } satisfies ApiResponse<{ updated: typeof updated }>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "업데이트 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
