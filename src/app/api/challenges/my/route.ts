import { NextResponse } from "next/server";
import {
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapUserChallenge } from "@/lib/mappers";
import { MOCK_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, Challenge } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_CHALLENGES,
        error: null,
      } satisfies ApiResponse<Challenge[]>);
    }

    const UC = FIELDS.userChallenges;
    const [userChallengeRecords, challengeRecords] = await Promise.all([
      listRecords(
        TABLES.userChallenges,
        {
          filterByFormula: `{${UC.status}}="진행중"`,
        },
        { skipCache: true },
      ),
      listRecords(TABLES.challenges, undefined, { skipCache: true }),
    ]);

    const challengeById = new Map(
      challengeRecords.map((record) => [record.id, record]),
    );

    return NextResponse.json({
      data: userChallengeRecords.map((record) =>
        mapUserChallenge(record, challengeById),
      ),
      error: null,
    } satisfies ApiResponse<Challenge[]>);
  } catch {
    return NextResponse.json({
      data: MOCK_CHALLENGES,
      error: null,
    } satisfies ApiResponse<Challenge[]>);
  }
}
