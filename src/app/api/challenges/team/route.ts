import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {

  loadUserForEligibility,

  resolveUserTeamRecordId,

} from "@/lib/challenge-eligibility";

import {

  createRecord,

  FIELDS,

  findOrCreateTeamByName,

  isAirtableConfigured,

  TABLES,

} from "@/lib/airtable";

import { mapTeamChallenge } from "@/lib/mappers";

import {

  listTeamChallengesWithCounts,

  resolveCheckinUserId,

} from "@/lib/team-checkin";

import type { ApiResponse, TeamChallenge } from "@/lib/types";



export const dynamic = "force-dynamic";



export async function GET() {

  try {

    const session = await auth();

    const userId = await resolveCheckinUserId(session);

    const data = await listTeamChallengesWithCounts(userId);

    return NextResponse.json({

      data,

      error: null,

    } satisfies ApiResponse<TeamChallenge[]>);

  } catch (err) {

    const message = err instanceof Error ? err.message : "조회 실패";

    return NextResponse.json(

      { data: null, error: message } satisfies ApiResponse<TeamChallenge[]>,

      { status: 500 },

    );

  }

}



export async function POST(request: Request) {

  try {

    const session = await auth();

    const userId = await resolveCheckinUserId(session);

    if (!userId) {

      return NextResponse.json(

        {

          data: null,

          error: "로그인이 필요합니다.",

        } satisfies ApiResponse<TeamChallenge>,

        { status: 401 },

      );

    }



    const body = (await request.json()) as {

      title?: string;

    };

    const title = body.title?.trim();



    if (!title) {

      return NextResponse.json(

        {

          data: null,

          error: "챌린지 이름을 입력해 주세요.",

        } satisfies ApiResponse<TeamChallenge>,

        { status: 400 },

      );

    }



    const user = await loadUserForEligibility(userId);

    const company = user.company?.trim() ?? "";

    const teamName = user.team?.trim() ?? "";



    if (!company || !teamName) {

      return NextResponse.json(

        {

          data: null,

          error: "프로필에 회사와 부서를 먼저 입력해 주세요.",

        } satisfies ApiResponse<TeamChallenge>,

        { status: 400 },

      );

    }



    if (!isAirtableConfigured()) {

      const teamId =

        (await resolveUserTeamRecordId(user)) ?? `mock-team-${Date.now()}`;

      const created: TeamChallenge = {

        id: `mock-${Date.now()}`,

        title,

        company,

        teamName,

        teamId,

        participants: 0,

        completionRate: 0,

        canParticipate: true,

        createdTime: new Date().toISOString(),

      };

      return NextResponse.json({

        data: created,

        error: null,

      } satisfies ApiResponse<TeamChallenge>);

    }



    const TC = FIELDS.teamChallenges;

    const team = await findOrCreateTeamByName(teamName, company);



    const fields: Record<string, unknown> = {

      [TC.title]: title,

      [TC.company]: company,

      [TC.completionRate]: 0,

      [TC.team]: [team.id],

    };



    let record;

    try {

      record = await createRecord(TABLES.teamChallenges, {

        ...fields,

        [TC.teamName]: teamName,

      });

    } catch {

      record = await createRecord(TABLES.teamChallenges, fields);

    }



    const mapped = mapTeamChallenge(record);

    if (!mapped.teamName) mapped.teamName = teamName;

    mapped.participants = 0;

    mapped.canParticipate = true;



    return NextResponse.json({

      data: mapped,

      error: null,

    } satisfies ApiResponse<TeamChallenge>);

  } catch (err) {

    const message = err instanceof Error ? err.message : "생성 실패";

    return NextResponse.json(

      { data: null, error: message } satisfies ApiResponse<TeamChallenge>,

      { status: 500 },

    );

  }

}


