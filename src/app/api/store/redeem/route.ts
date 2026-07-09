import { NextResponse } from "next/server";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  updateRecord,
  TABLES,
} from "@/lib/airtable";
import { MOCK_STORE_ITEMS, MOCK_USER } from "@/lib/mock-data";
import type { ApiResponse } from "@/lib/types";

interface RedeemResult {
  mileage: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { itemId?: string };
    const itemId = body.itemId;
    if (!itemId) {
      return NextResponse.json(
        {
          data: null,
          error: "상품 ID가 필요합니다.",
        } satisfies ApiResponse<RedeemResult>,
        { status: 400 },
      );
    }

    if (!isAirtableConfigured()) {
      const item = MOCK_STORE_ITEMS.find((i) => i.id === itemId);
      if (!item) {
        return NextResponse.json(
          {
            data: null,
            error: "상품을 찾을 수 없습니다.",
          } satisfies ApiResponse<RedeemResult>,
          { status: 404 },
        );
      }
      const current = MOCK_USER.mileage ?? 0;
      if (current < item.price) {
        return NextResponse.json(
          {
            data: null,
            error: "마일리지가 부족합니다.",
          } satisfies ApiResponse<RedeemResult>,
          { status: 400 },
        );
      }
      return NextResponse.json({
        data: { mileage: current - item.price },
        error: null,
      } satisfies ApiResponse<RedeemResult>);
    }

    const item = await getRecord(TABLES.storeItems, itemId);
    const price = Number(item.fields[FIELDS.storeItems.price] ?? 0);

    const users = await listRecords(TABLES.users, { maxRecords: "1" });
    if (!users[0]) {
      return NextResponse.json(
        {
          data: null,
          error: "사용자를 찾을 수 없습니다.",
        } satisfies ApiResponse<RedeemResult>,
        { status: 404 },
      );
    }

    const currentMileage = Number(
      users[0].fields[FIELDS.users.mileage] ?? 0,
    );
    if (currentMileage < price) {
      return NextResponse.json(
        {
          data: null,
          error: "마일리지가 부족합니다.",
        } satisfies ApiResponse<RedeemResult>,
        { status: 400 },
      );
    }

    const nextMileage = currentMileage - price;
    await updateRecord(TABLES.users, users[0].id, {
      [FIELDS.users.mileage]: nextMileage,
    });

    return NextResponse.json({
      data: { mileage: nextMileage },
      error: null,
    } satisfies ApiResponse<RedeemResult>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "교환 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<RedeemResult>,
      { status: 500 },
    );
  }
}
