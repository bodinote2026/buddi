import { NextResponse } from "next/server";
import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapUserChallenge } from "@/lib/mappers";
import { MOCK_CHALLENGES } from "@/lib/mock-data";
import type { ApiResponse, Challenge } from "@/lib/types";

export const dynamic = "force-dynamic";

function collectChallengeLinkIds(
  fields: Record<string, unknown>,
): string[] {
  const UC = FIELDS.userChallenges;
  const ids = new Set<string>();
  const linkFieldNames = [UC.challenge, "Challenge", "Challenges"];

  const addId = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("rec")) {
      ids.add(value);
      return;
    }
    if (Array.isArray(value)) {
      if (typeof value[0] === "string") ids.add(value[0]);
      else if (value[0] && typeof value[0] === "object") {
        const id = (value[0] as { id?: string }).id;
        if (typeof id === "string") ids.add(id);
      }
    }
  };

  for (const key of linkFieldNames) {
    addId(fields[key]);
  }

  for (const value of Object.values(fields)) {
    addId(value);
  }

  return [...ids];
}

export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: MOCK_CHALLENGES,
        error: null,
      } satisfies ApiResponse<Challenge[]>);
    }

    const UC = FIELDS.userChallenges;
    const C = FIELDS.challenges;
    const userChallengeRecords = await listRecords(
      TABLES.userChallenges,
      {
        filterByFormula: `OR({${UC.status}}="진행중",{${UC.status}}="진행 중")`,
      },
      { skipCache: true },
    );

    const challengeRecords = await listRecords(
      TABLES.challenges,
      {
        filterByFormula: `{${C.isActive}}=TRUE()`,
      },
      { skipCache: true },
    );

    const challengeById = new Map(
      challengeRecords.map((record) => [record.id, record]),
    );

    const missingLinkIds = new Set<string>();
    for (const record of userChallengeRecords) {
      for (const linkId of collectChallengeLinkIds(record.fields)) {
        if (!challengeById.has(linkId)) missingLinkIds.add(linkId);
      }
    }

    await Promise.all(
      [...missingLinkIds].map(async (linkId) => {
        try {
          const linked = await getRecord(TABLES.challenges, linkId);
          challengeById.set(linkId, linked);
        } catch {
          /* linked challenge may have been removed */
        }
      }),
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
