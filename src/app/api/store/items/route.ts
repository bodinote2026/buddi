import { NextResponse } from "next/server";
import { FIELDS, isAirtableConfigured, listRecords, TABLES } from "@/lib/airtable";
import { mapStoreItem } from "@/lib/mappers";
import { MOCK_STORE_ITEMS } from "@/lib/mock-data";
import type { ApiResponse, StoreItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function activeItems(items: StoreItem[]): StoreItem[] {
  return items.filter((item) => item.isActive);
}

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: activeItems(MOCK_STORE_ITEMS),
        error: null,
      } satisfies ApiResponse<StoreItem[]>);
    }

    const S = FIELDS.storeItems;
    const records = await listRecords(
      TABLES.storeItems,
      {
        filterByFormula: `{${S.isActive}}=TRUE()`,
      },
      { skipCache: true },
    );

    return NextResponse.json({
      data: records.map(mapStoreItem),
      error: null,
    } satisfies ApiResponse<StoreItem[]>);
  } catch {
    return NextResponse.json({
      data: activeItems(MOCK_STORE_ITEMS),
      error: null,
    } satisfies ApiResponse<StoreItem[]>);
  }
}
