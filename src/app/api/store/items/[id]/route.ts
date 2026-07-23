import { NextResponse } from "next/server";
import { getRecord, isAirtableConfigured, TABLES } from "@/lib/airtable";
import { mapStoreItem } from "@/lib/mappers";
import { MOCK_STORE_ITEMS } from "@/lib/mock-data";
import type { ApiResponse, StoreItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    if (!isAirtableConfigured()) {
      const item = MOCK_STORE_ITEMS.find((row) => row.id === id);
      if (!item || !item.isActive) {
        return NextResponse.json(
          {
            data: null,
            error: "상품을 찾을 수 없습니다.",
          } satisfies ApiResponse<StoreItem>,
          { status: 404 },
        );
      }
      return NextResponse.json({
        data: item,
        error: null,
      } satisfies ApiResponse<StoreItem>);
    }

    const record = await getRecord(TABLES.storeItems, id);
    const item = mapStoreItem(record);

    if (!item.isActive) {
      return NextResponse.json(
        {
          data: null,
          error: "판매 중인 상품이 아닙니다.",
        } satisfies ApiResponse<StoreItem>,
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: item,
      error: null,
    } satisfies ApiResponse<StoreItem>);
  } catch {
    const item = MOCK_STORE_ITEMS.find((row) => row.id === id);
    if (!item || !item.isActive) {
      return NextResponse.json(
        {
          data: null,
          error: "상품을 찾을 수 없습니다.",
        } satisfies ApiResponse<StoreItem>,
        { status: 404 },
      );
    }
    return NextResponse.json({
      data: item,
      error: null,
    } satisfies ApiResponse<StoreItem>);
  }
}
