import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDisplayName } from "@/lib/format";
import {
  performTeamCheckin,
  resolveCheckinUserId,
  TeamCheckinError,
} from "@/lib/team-checkin";
import type { ApiResponse, TeamCheckinResult } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** MVP: accept image upload; auto-approve when file present (AI stub). */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await auth();
    const userId = resolveCheckinUserId(session?.user?.airtableId);
    if (!userId) {
      return NextResponse.json(
        {
          data: null,
          error: "로그인이 필요합니다.",
        } satisfies ApiResponse<TeamCheckinResult>,
        { status: 401 },
      );
    }

    const form = await request.formData();
    const image = form.get("image");
    if (!image || !(image instanceof Blob) || image.size === 0) {
      return NextResponse.json(
        {
          data: null,
          error: "인증 사진이 필요합니다.",
        } satisfies ApiResponse<TeamCheckinResult>,
        { status: 400 },
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
    const message = err instanceof Error ? err.message : "사진 인증 실패";
    console.error("[api/team/verify-photo]", message, err);
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<TeamCheckinResult>,
      { status: 500 },
    );
  }
}
