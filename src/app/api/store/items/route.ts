import { NextResponse } from "next/server";
import { isAirtableConfigured, listRecords, TABLES } from "@/lib/airtable";
import { mapStoreItem } from "@/lib/mappers";
import { MOCK_STORE_ITEMS } from "@/lib/mock-data";
import type { ApiResponse, StoreItem } from "@/lib/types";

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_STORE_ITEMS,
        error: null,
      } satisfies ApiResponse<StoreItem[]>);
    }

    const records = await listRecords(TABLES.storeItems);

    return NextResponse.json({
      data: records.map(mapStoreItem),
      error: null,
    } satisfies ApiResponse<StoreItem[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_STORE_ITEMS,
      error: null,
    } satisfies ApiResponse<StoreItem[]>);
  }
}
