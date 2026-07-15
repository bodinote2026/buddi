import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTeamChallengeDetail,
  resolveCheckinUserId,
  TeamCheckinError,
} from "@/lib/team-checkin";
import type { ApiResponse, TeamChallengeDetail } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await auth();
    const userId = resolveCheckinUserId(session?.user?.airtableId);

    const detail = await getTeamChallengeDetail(id, userId);

    return NextResponse.json({
      data: detail,
      error: null,
    } satisfies ApiResponse<TeamChallengeDetail>);
  } catch (err) {
    if (err instanceof TeamCheckinError) {
      return NextResponse.json(
        {
          data: null,
          error: err.message,
        } satisfies ApiResponse<TeamChallengeDetail>,
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "조회 실패";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<TeamChallengeDetail>,
      { status: 500 },
    );
  }
}
