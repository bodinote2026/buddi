import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserCompany,
  listCompanyBuddies,
} from "@/lib/company-buddies";
import { resolveCheckinUserId } from "@/lib/team-checkin";
import type { ApiResponse, Buddy } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMPTY_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    const session = await auth();
    const userId = await resolveCheckinUserId(session);
    if (!userId) {
      return NextResponse.json(
        {
          data: [],
          error: null,
        } satisfies ApiResponse<Buddy[]>,
        { headers: EMPTY_HEADERS },
      );
    }

    const company = await getUserCompany(userId);
    if (!company) {
      return NextResponse.json(
        {
          data: [],
          error: null,
        } satisfies ApiResponse<Buddy[]>,
        { headers: EMPTY_HEADERS },
      );
    }

    const data = await listCompanyBuddies(userId, company);

    return NextResponse.json(
      {
        data,
        error: null,
      } satisfies ApiResponse<Buddy[]>,
      { headers: EMPTY_HEADERS },
    );
  } catch {
    return NextResponse.json(
      {
        data: [],
        error: null,
      } satisfies ApiResponse<Buddy[]>,
      { headers: EMPTY_HEADERS },
    );
  }
}
