import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDisplayName } from "@/lib/format";
import {
  mapCheckinAirtableError,
  performTeamCheckin,
  resolveCheckinUserId,
  TeamCheckinError,
} from "@/lib/team-checkin";
import type { ApiResponse, TeamCheckinResult } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await auth();
    const userId = await resolveCheckinUserId(session);
    if (!userId) {
      return NextResponse.json(
        {
          data: null,
          error: "로그인이 필요합니다.",
        } satisfies ApiResponse<TeamCheckinResult>,
        { status: 401 },
      );
    }

    const nickname =
      session?.user?.nickname ??
      session?.user?.name ??
      "buddi_user";

    const result = await performTeamCheckin({
      userId,
      nickname: getDisplayName({ name: "", nickname }),
      challengeId: id,
    });

    return NextResponse.json({
      data: result,
      error: null,
    } satisfies ApiResponse<TeamCheckinResult>);
  } catch (err) {
    if (err instanceof TeamCheckinError) {
      return NextResponse.json(
        { data: null, error: err.message } satisfies ApiResponse<TeamCheckinResult>,
        { status: err.status },
      );
    }
    const mapped = mapCheckinAirtableError(err);
    if (mapped) {
      return NextResponse.json(
        { data: null, error: mapped.message } satisfies ApiResponse<TeamCheckinResult>,
        { status: mapped.status },
      );
    }
    const message = err instanceof Error ? err.message : "인증 실패";
    console.error("[api/team/checkin]", message, err);
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<TeamCheckinResult>,
      { status: 500 },
    );
  }
}
