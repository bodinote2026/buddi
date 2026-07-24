import {
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  TABLES,
} from "./airtable";
import { mapUser, mapUserToBuddy } from "./mappers";
import { getMockProfile, listMockProfiles } from "./mock-profile-store";
import type { Buddy, User } from "./types";

function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function getUserCompany(userId: string): Promise<string> {
  if (!isAirtableConfigured() || userId.startsWith("mock-")) {
    return getMockProfile(userId)?.company?.trim() ?? "";
  }

  try {
    const record = await getRecord(TABLES.users, userId);
    return mapUser(record).company?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function listCompanyBuddies(
  userId: string,
  company: string,
): Promise<Buddy[]> {
  const trimmedCompany = company.trim();
  if (!trimmedCompany) return [];

  if (!isAirtableConfigured() || userId.startsWith("mock-")) {
    return listMockProfiles()
      .filter(
        (user) =>
          user.id !== userId &&
          user.company?.trim() === trimmedCompany &&
          Boolean(user.company?.trim()),
      )
      .map((user) => mapUserToBuddyFromUser(user))
      .sort((a, b) => b.temperature - a.temperature);
  }

  const U = FIELDS.users;
  const escapedCompany = escapeFormulaValue(trimmedCompany);
  const escapedUserId = escapeFormulaValue(userId);

  const records = await listRecords(
    TABLES.users,
    {
      filterByFormula: `AND({${U.company}}="${escapedCompany}", {${U.company}}!="", RECORD_ID()!="${escapedUserId}")`,
      "sort[0][field]": U.temperature,
      "sort[0][direction]": "desc",
    },
    { skipCache: true },
  );

  return records
    .map(mapUserToBuddy)
    .filter((buddy) => buddy.company.trim().length > 0);
}

function mapUserToBuddyFromUser(user: User): Buddy {
  const nickname = user.nickname ?? user.displayName;
  return {
    id: user.id,
    name: nickname,
    age: user.age,
    temperature: user.temperature ?? 36.5,
    company: user.company ?? "",
    team: user.team ?? "",
    intro: user.intro,
    interests: user.interests,
    avatarUrl:
      user.avatarUrl ??
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(nickname || user.id)}`,
  };
}
