import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { loadUserForEligibility } from "@/lib/challenge-eligibility";
import {
  escapeFormulaValue,
  FIELDS,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "@/lib/airtable";
import { mapTeam } from "@/lib/mappers";
import { MOCK_TEAMS } from "@/lib/mock-data";
import { resolveCheckinUserId } from "@/lib/team-checkin";
import type { ApiResponse, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

function filterMockTeams(scope: "all" | "mine", company: string): Team[] {
  const sorted = [...MOCK_TEAMS].sort((a, b) => b.points - a.points);
  if (scope === "all") return sorted;
  if (!company) return [];
  return sorted.filter((team) => team.company?.trim() === company);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") === "mine" ? "mine" : "all";

  try {
    let company = "";
    if (scope === "mine") {
      const session = await auth();
      const userId = await resolveCheckinUserId(session);
      if (!userId) {
        return NextResponse.json({
          data: [],
          error: null,
        } satisfies ApiResponse<Team[]>);
      }

      const user = await loadUserForEligibility(userId);
      company = user.company?.trim() ?? "";
      if (!company) {
        return NextResponse.json({
          data: [],
          error: null,
        } satisfies ApiResponse<Team[]>);
      }
    }

    if (!isAirtableConfigured()) {
      return NextResponse.json({
        data: filterMockTeams(scope, company),
        error: null,
      } satisfies ApiResponse<Team[]>);
    }

    const T = FIELDS.teams;
    const listOptions: Record<string, string> = {
      "sort[0][field]": T.points,
      "sort[0][direction]": "desc",
    };
    if (scope === "mine" && company) {
      listOptions.filterByFormula = `{${T.company}}="${escapeFormulaValue(company)}"`;
    }

    const records = await listRecords(TABLES.teams, listOptions);

    return NextResponse.json({
      data: records.map(mapTeam),
      error: null,
    } satisfies ApiResponse<Team[]>);
  } catch {
    return NextResponse.json({
      data: filterMockTeams(scope, ""),
      error: null,
    } satisfies ApiResponse<Team[]>);
  }
}
